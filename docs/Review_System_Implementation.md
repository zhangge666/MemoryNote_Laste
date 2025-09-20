# 复习系统（SRS）完整实现与演进报告

本文档总结 MemoryNote 的复习系统从零到可用的实现方案、当前落地状态、关键技术决策与后续演进路线，便于团队协作与后续扩展。

## 1. 目标与范围
- 面向本地优先（离线可用），可选云端同步。
- 以“卡片”为最小复习单元，支持到期队列、打分调度、历史记录与来源文档关联。
- 与现有 Electron + Vue + Pinia 架构无缝集成，尽量少侵入、可扩展。

## 2. 当前已实现（2025-09）
- UI：`ReviewPanel.vue` 复习面板（到期卡片、困难/一般/容易打分、跳过、刷新队列、载入示例、云端推/拉按钮）。
- Store：`useReviewStore`（Pinia）
  - 优先通过 IPC 使用本地 SQLite 持久化；无 IPC 时回退内存数据。
  - 方法：`init()`、`loadAll()`、`buildQueue()`、`seedMock()`、`addCard()`、`rate()`、`cloudPushAll()`、`cloudPullAll()`。
- 本地持久化：`better-sqlite3`
  - 主进程 `src/main.ts` 初始化 `review.db`（WAL），建表 `cards/anchors/schedules/reviews`。
  - IPC：`review:init`、`review:cards:listAll`、`review:cards:due`、`review:card:add`、`review:card:rate`、`review:seedMock`。
- 云端骨架：Supabase（Postgres）
  - IPC：`cloud:config:get/set` 保存云配置；`cloud:review:pushAll` 全量 upsert、`cloud:review:pullAll` 全量拉取。
- 运行构建适配：
  - `vite.main.config.ts` 将 `better-sqlite3` 作为 external，并 `ignoreDynamicRequires`，避免打包期的动态 require 报错。
  - Windows 开发机已实测编译通过（Electron 38 需 C++20）。

## 3. 架构概览
- 前端（Renderer）：Vue + Pinia，`ReviewPanel.vue` 驱动 UI，`useReviewStore` 统一状态与调用。
- 预加载（Preload）：`window.mn.review.*` 暴露复习相关 IPC；`window.mn.ipc.invoke` 用于云端调用。
- 主进程（Main）：封装 SQLite CRUD + 调度落库 + 云端 push/pull。
- 云端（可选）：Supabase（Postgres + Realtime + Auth + Storage），当前实现为最小 push/pull，后续支持增量。

## 4. 数据模型（本地与云端保持一致）
表结构（已落地项：cards/schedules/reviews；anchors 已预留）：
- cards
  - id TEXT PK
  - title TEXT
  - content TEXT
  - path TEXT NULL（关联来源文件路径，弱关联）
  - archived INTEGER DEFAULT 0
  - created_at INTEGER（epoch ms）
  - updated_at INTEGER
- anchors（预留，后续用于“强关联/精确锚点”）
  - card_id TEXT PK
  - path TEXT
  - start INTEGER, end INTEGER（UTF-16 偏移）
  - anchor_before TEXT, anchor_after TEXT（上下文）
  - hash TEXT（片段哈希）
- schedules
  - card_id TEXT PK
  - next_review_at INTEGER
  - interval_days INTEGER
  - ease REAL
  - repetitions INTEGER
  - updated_at INTEGER
- reviews（仅追加）
  - id TEXT PK
  - card_id TEXT
  - reviewed_at INTEGER
  - quality INTEGER（0-5）
  - interval_after INTEGER
  - ease_after REAL

说明：
- 采用卡片为中心的经典模型；审阅历史只追加，便于统计与审计。
- anchors 先不强制使用，后续迭代引入“锚点稳定”（见 §9）。

## 5. IPC 接口（主进程）
```text
review:init → { ok, path }
review:cards:listAll → rows[]
review:cards:due(now?, limit?) → rows[]
review:card:add({ title, content, path? }) → { id }
review:card:rate(cardId, quality) → { ok, next_review_at, interval_days, ease, repetitions }
review:seedMock → { ok }

cloud:config:get/set → 读取/写入 settings.json 的 cloud 字段（supabaseUrl/supabaseKey）
cloud:review:pushAll → 将本地四表全量 upsert 至云端
cloud:review:pullAll → 云端四表全量拉取覆盖本地
```

## 6. Preload API（渲染可用）
```ts
window.mn.review = {
  init(), listAll(), listDue(now?, limit?), addCard(payload), rate(cardId, quality), seedMock()
}
// 云端使用 window.mn.ipc.invoke('cloud:...')
```

## 7. 调度算法（SM‑2 简化版）
- 失败（q<3）：`repetitions=0`，`interval=1`。
- 成功（q≥3）：
  - `ease = max(1.3, ease + 0.1 - (5-q)*(0.08 + (5-q)*0.02))`
  - `repetitions += 1`
  - 间隔：第一次 1 天、第二次 6 天、之后 `round(interval * ease)`
  - 更新 `next_review_at = now + interval*86400_000`

后续可无缝替换为 FSRS（更优拟合），不影响表结构。

## 8. UI 交互（ReviewPanel）
- 顶部：到期数量、刷新队列、载入示例、推送云端、拉取云端。
- 中部：当前卡片内容展示（空队列给提示）。
- 底部：队列长度、跳过、困难/一般/容易打分。
- 视觉风格：统一 Tailwind 体系，浅边框、暗色适配、玻璃拟态背景。

## 9. 与笔记文档的关联（现状与计划）
- 现状：弱关联（cards.path 可选）；可在复习页中根据 path 打开来源文档（可加按钮）。
- 计划升级为强关联：
  1) anchors 表存精确锚点（start/end + 上下文 + hash）。
  2) “保存笔记”时做块/句级 diff，生成“卡片建议”（新增/修改/删除/重锚），用户确认再入库，降低噪音。
  3) 复习页支持“一键跳回来源并高亮”。

## 10. 同步策略（后续建议）
- 当前：全量 push/pull（MVP）。
- 建议：增量同步（oplog）
  - 本地写入同时记录操作日志（op 表），上线后 push 增量；服务端广播通知，客户端拉取 since_token 之后的 ops 重放。
  - 合并策略：cards/schedules 字段级 LWW，reviews 只追加；删除用 archived 标记。

## 11. 打包与分发（原生模块）
- 开发环境：Electron 38 + better-sqlite3 11.x，需要 C++20/VS2022 编译链；`electron-rebuild` 针对 Electron 头文件重建。
- 构建配置：
  - `vite.main.config.ts` external: ['better-sqlite3']，commonjsOptions.ignoreDynamicRequires = true。
  - Forge 打包时启用 auto-unpack-natives，确保 .node 不被 asar 封装。
- 用户分发：产出安装包，用户侧无需编译环境。

## 12. 性能与稳定性
- SQLite WAL 模式，写入可并发、崩溃不丢库。
- 队列构建 O(n log n)（按到期排序），数据量万级可接受。
- 预留索引：schedules.next_review_at、cards.path、reviews.card_id。

## 13. 安全与隐私
- 本地：review.db 存在配置目录；可按工作区隔离（后续将库放到 workspace/.mn/）。
- 云端：可选端到端加密（客户端加密 payload，服务端仅存密文）。
- 权限：云端推荐 RLS（行级安全）隔离 workspace/user 数据。

## 14. 测试清单
- 单元：调度计算（边界 q=0/5，首次与多次间隔）；DB CRUD；IPC 参数校验。
- 集成：载入示例→构建队列→打分出队；云端 push/pull 一致性；断网重连场景。
- 回归：打包产物在三平台运行（Windows/macOS/Linux）。

## 15. 演进路线（建议优先级）
1) 云配置 UI + 启动自动 `init/loadAll` + 本地写后后台 debounce push（离线缓存、失败重试）。
2) 编辑器选区一键建卡（写 cards/anchors），复习页“打开来源并高亮”。
3) 保存时“卡片建议”面板（新增/重锚/归档）。
4) FSRS 调度、统计面板（今日待复习、记忆曲线、易错卡片）。
5) 增量同步：oplog 表 + since_token 拉取 + Realtime 通知。

## 16. 文件索引（关键实现位置）
- 主进程：`src/main.ts`（SQLite 初始化、IPC、云 push/pull）
- 预加载：`src/preload.ts`（暴露 window.mn.review 与 cloud IPC）
- Store：`src/stores/review.ts`（IPC 优先，内存回退，云方法）
- UI：`src/ui/components/ReviewPanel.vue`（交互与按钮）
- 构建：`vite.main.config.ts`（native 外部化与动态 require）

## 17. 已知限制
- anchors 尚未启用：卡片与文档仅弱关联。
- 同步为全量：暂未实现 oplog 增量与冲突解决。
- 没有云配置 UI：需手动在 settings.json 写入 `cloud.supabaseUrl/supabaseKey`。

---
如需我继续推进第 1/2 项（自动同步、选区建卡+跳回来源），可直接在 Issue/Backlog 中创建任务，我按上述方案落地。


