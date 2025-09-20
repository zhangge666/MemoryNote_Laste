### 概要
- **项目名称**: MemoryNote（个人知识库 + 语义检索 + 复习系统）
- **技术栈**: Electron + Vue 3 + Vite + TypeScript + Pinia + TailwindCSS + vue-i18n
- **存储**: 完全本地化（默认工作区 `安装目录/workerspace`，插件目录 `安装目录/.memorynote`）
- **核心价值**: 知识记录与检索、基于艾宾浩斯的复习提醒、本地知识库优先的语义检索与问答、错误/遗漏的智能纠错提醒、可插件化扩展的桌面应用

---

## 1. 架构设计

### 1.1 进程与边界
- **Main(主进程)**: 窗口与生命周期、应用设置与路径、文件系统访问、索引服务、插件管理、通知与托盘、IPC 统筹。
- **Preload(预加载)**: 使用 `contextBridge` 暴露安全 API（文件操作、插件 API、设置 API、索引/搜索 API、LLM 提供者等）。
- **Renderer(渲染进程)**: Vue 应用（UI、状态管理、编辑器/标签页、分屏、设置、插件 UI 宿主、状态栏等）。

### 1.2 目录与资源
- `workerspace`（默认工作区，注意用户约定拼写）:
  - `notes/` 笔记（建议 Markdown/图片/附件）
  - `.index/` 检索与embedding索引
  - `.cache/` 缓存（缩略图、embedding缓存）
- `.memorynote`（插件目录）:
  - `<plugin-id>/manifest.json`
  - `<plugin-id>/main.(js|ts)`（可选）
  - `<plugin-id>/renderer.(js|ts)`（可选）
  - `<plugin-id>/data.json`（插件私有数据）
  - `<plugin-id>/assets/*`
- `config/settings.json`（应用设置）
- `logs/*.log`（运行日志）

首次启动：若不存在目录则自动创建并扫描 `workerspace` 与 `.memorynote`。

### 1.3 数据持久化
- 设置/索引/插件数据：JSON 文件（原子写 + 临时文件覆盖策略）
- 文本笔记：文件系统（UTF-8）
- 索引：全文（FlexSearch/Lunr），语义向量（本地 hnswlib/自建 SQLite 向量表）
- 复习计划：`workerspace/.index/srs.json`
- i18n：`/locales/*.json`（按语言包拆分）

---

## 2. UI 布局与交互

### 2.1 顶层布局（从上到下）
- **标题栏**（自定义，`-webkit-app-region` 可拖拽）：
  - 左：软件 icon
  - 左：左侧栏伸缩按钮（带过渡动画）
  - 中：全局搜索按钮
  - 右：用户头像、右侧栏伸缩按钮（动画同左侧栏）、最小化/最大化/关闭
  - 右键增强（标题栏空白处）：布局预设、标签视图管理、快速打开命令面板
- **工作区**（从左到右：侧边导航栏、左侧栏、内容区、右侧栏）
  - 侧边导航栏：主页、订阅、搜索、日记、设置（支持插件注册新图标）
  - 左侧栏：工作目录树（展开/收起/右键增强，参考 Obsidian）
  - 内容区域：标签页 + 分屏（参考 VSCode）
  - 右侧栏：可挂载插件视图、复习今日、笔记信息、检索结果等
- **状态栏**
  - 左：与“服务器”连接状态（本地 LLM/索引服务/插件服务）
  - 右：工作区概览或当前笔记信息（字数、光标位置、保存状态等）

### 2.2 目录树与右键增强（参考 Obsidian）
- 文件/文件夹操作：新建、重命名、移动、删除、复制路径、在系统文件夹中打开
- 笔记操作：在新标签打开、在左/右/上/下分区打开、固定标签、标星、加入复习
- 预览：图片/附件内嵌预览
- 拖拽：文件到标签区创建新标签/分屏

### 2.3 标签页与分屏系统（参考 VSCode）
- 标签组（TabGroup）支持右/下方向拆分；嵌套分区
- 拖拽标签跨分区移动/合并
- 右键菜单：
  - 关闭当前、关闭其他、关闭右侧/左侧
  - 在左/右/上/下分区打开
  - 固定/取消固定
- 自动关闭空分区：当分区无标签时自动移除
- 会话恢复：重启恢复分屏与打开的文件/光标/滚动位置

---

## 3. 设置系统（自动保存）
- 统一的 Pinia 设置 Store + schema 校验（zod）
- 变更即保存（无“保存”按钮），带去抖与状态提示
- 支持导出/导入设置、重置
- 可切换工作目录（自动重建 watcher 与索引）
- 插件设置统一托管：每个插件有自己的设置面板，受统一的自动保存机制管理

示例设置 schema（摘录）：
```json
{
  "workspacePath": "C:/Apps/MemoryNote/workerspace",
  "language": "zh-CN",
  "theme": "system",
  "editor": { "fontSize": 14, "lineHeight": 1.6, "autosave": "off" },
  "search": { "provider": "local", "topK": 8 },
  "llm": { "provider": "ollama", "baseURL": "http://127.0.0.1:11434", "model": "qwen2.5:7b" }
}
```

---

## 4. 内存模型（未保存数据保真）
- 类 VSCode Text Model：每个打开的笔记有一个内存模型（content、version、dirty、selection）
- 切换标签不写盘，仅切换活跃模型
- 自动恢复：崩溃/断电后可从 `autosaveSnapshots/` 或内存恢复上次编辑状态（可配置）
- 保存策略：手动保存/延迟写盘；冲突检测（文件变更提醒与合并）
- 跨窗口单实例锁：避免并发写入

---

## 5. I18n
- `vue-i18n`，全量使用 `t('key.path')` 模式（避免 TS 常量直出）
- 语言包：`locales/zh-CN.json`、`locales/en-US.json`…
- 组件命名显示严格走 i18n key，支持插件提供自己的语言包并合并

示例 keys：
```json
{
  "titlebar": { "search": "搜索", "toggleLeft": "切换左侧栏" },
  "tabs": { "close": "关闭", "closeOthers": "关闭其他" },
  "status": { "connected": "已连接", "disconnected": "未连接" }
}
```

---

## 6. 检索与问答（NLP/LLM）

### 6.1 流程（本地优先）
- 全文检索：Lunr/FlexSearch 本地索引（按行/段落/标题）
- 语义检索：
  - 本地 embedding（建议 BGE/Sentence-BERT；中英双语优先）
  - 向量库：hnswlib 或 SQLite + HNSW 插件/自研结构
  - 增量索引：文件保存/变更事件触发 chunking + embedding + upsert
- RAG 问答：
  - 查询向量化 → Top-K 召回 → 可选重排（cosine + BM25 混合）
  - 构造 Prompt（以本地片段为“唯一信息源”）
  - LLM 回答：若本地无命中或矛盾，再请求 LLM 辅助解释
- 纠错/遗漏提醒：
  - 对问题与本地命中片段进行事实点抽取
  - 由 LLM 对比“应有要点 vs 当前笔记” → 生成“建议补充/修正”列表（不直接改文档）

### 6.2 嵌入/分块约定
- Markdown 分块：标题层级 + 段落 + 列表项；控制 300–800 tokens/块
- 存储：`{file, chunkId, headingPath, offset, text, embedding}`

### 6.3 LLM 提供者抽象
- `LocalLLMProvider`（如 `Ollama`/`LM Studio`）/ `RemoteProvider`（可选）
- 统一接口：`embed(text[])`、`chat(messages, options)`、`rerank(candidates, query)`
- 可在设置中切换/配置；状态栏回报连接状态

---

## 7. 艾宾浩斯复习提醒（SRS）
- 复习单元：可为“笔记文件”、“标题段落”或“卡片”（可从笔记一键抽取卡片）
- 计划生成：基于记忆曲线的多次复习间隔（例如 1d/2d/4d/7d/15d/30d）
- 打分：`Again/Hard/Good/Easy`（调整下一次间隔，支持 SM-2 可选）
- 今日复习视图：右侧栏/独立面板，系统通知提醒，支持延后/Snooze
- 数据：`srs.json`，记录条目、上次时间、下次时间、历史表现

---

## 8. 插件系统（类 Obsidian）

### 8.1 插件结构
- 目录：`安装目录/.memorynote/<plugin-id>/`
- 文件：
  - `manifest.json`（必需）
  - `main.(ts|js)`（主进程扩展，可选）
  - `renderer.(ts|js)`（渲染扩展，可选）
  - `data.json`（插件自管持久化）
  - `assets/*`（静态资源）

示例 `manifest.json`：
```json
{
  "id": "com.example.heatmap",
  "name": "贡献热力图",
  "version": "1.0.0",
  "author": "you",
  "description": "在右侧栏展示编辑热力图",
  "entry": { "main": "main.js", "renderer": "renderer.js" },
  "settings": { "enable": true, "color": "#22c55e" },
  "i18n": { "zh-CN": "locales/zh-CN.json", "en-US": "locales/en-US.json" },
  "mountPoints": { "sidebar": true, "rightPanel": true, "statusBar": false }
}
```

### 8.2 生命周期与隔离
- 生命周期：`onload(ctx)` → `onunload()`；`onSettingsChanged(newSettings)`
- 隔离：插件在受限上下文运行；与主应用通过受控 API 通讯（无直接 Node 能力）
- 安全：签名/校验可选；访问 FS 需走宿主暴露的受限接口（插件仅能访问自己的数据目录与被授权的工作区资源）

### 8.3 插件 API（摘要）
- UI 扩展：
  - `registerSidebarIcon({id, tooltip, icon, onClick})`
  - `registerRightPanel({id, component, title})`
  - `registerStatusItem({id, render})`
  - `registerCommands([{id, title, run, keybinding}])`
  - `registerContextMenu(items, scope)`（目录树/标签页/编辑器）
- 功能扩展：
- `registerNoteProcessor(fn)`（内容处理/导出）
  - `registerIndexer({id, index, search})`（自定义索引）
  - `registerSRSStrategy(strategy)`（自定义复习策略）
- 存储/文件：
  - `getPluginData()` / `setPluginData(partial)`
  - `readWorkspaceFile(path)` / `writeWorkspaceFile(path, content)`
- 事件总线：
  - `on(event, handler)` / `emit(event, payload)`（如 `note:opened`、`note:saved`、`search:queried`）

### 8.4 设置与国际化
- 每个插件自带设置面板（在“设置”窗口统一管理，变更即保存）
- 插件可注册自己的语言包，按当前语言合并到应用 i18n 树

---

## 9. IPC 与暴露 API（摘录）

预加载层暴露：
- `app.getPaths()`、`app.openInSystem(path)`
- `settings.get()/set(partial)`、`settings.watch(key, cb)`
- `workspace.scan()`、`workspace.watch()`、`workspace.open(file)`、`workspace.save(file, content)`
- `tabs.open({file, group, position})`、`tabs.split(direction)`
- `search.fulltext(query)`、`search.semantic(query, {topK})`
- `llm.embed(texts)`、`llm.chat(messages, opts)`、`llm.status()`
- `srs.add(target)`、`srs.review(id, grade)`、`srs.today()`
- `plugins.list()`、`plugins.enable(id)`、`plugins.disable(id)`、`plugins.openSettings(id)`

通道采用类型安全定义，所有文件系统与网络操作只在主进程执行。

---

## 10. 状态管理（Pinia Stores）
- `useLayoutStore`：侧栏显隐、分屏布局、主题
- `useTabsStore`：标签组、激活标签、持久化会话
- `useEditorStore`：内存模型、dirty、selection、保存/恢复
- `useWorkspaceStore`：目录树、watcher 状态、统计
- `useSearchStore`：全文/语义结果、最近搜索
- `useSRSStore`：计划、今日任务、统计
- `useSettingsStore`：设置、自动保存状态、schema 校验
- `usePluginsStore`：插件列表、启停、挂载点注册

---

## 11. 错误与日志
- 统一 Logger（main/renderer 分通道），落地到 `logs/`，用户可从“帮助”导出日志
- 关键流程错误提示（保存失败/索引失败/LLM 不可达）
- 索引与插件错误不阻塞主流程，提供降级路径

---

## 12. 性能策略
- 索引管线异步/批处理，文件变更合并去抖
- 大文件分块并行 embedding（并发数可配置）
- 启动阶段延迟加载（按需加载编辑器/插件）
- 虚拟列表渲染目录树与搜索结果
- 向量检索本地内存映射 + 分页扫描

---

## 13. 测试策略
- 单元：Store、SRS 计算、索引器、设置自动保存
- 集成：IPC 接口、插件加载/卸载、分屏交互
- 端到端：常见用户路径（创建→编辑→检索→复习→重启恢复）
- 兼容：中文/英文/多语言；Windows 高分屏；无 LLM 可用场景

---

## 14. 里程碑与验收标准

- M1 基础框架与布局
  - 自定义标题栏、侧边导航/左右侧栏、目录树、标签页（单分区）
  - 设置（自动保存）、i18n、内存模型（基本）
  - 验收：切换标签不丢数据；设置变更自动落盘；多语言切换生效

- M2 分屏与增强交互
  - 标签分组/左右上下分屏、右键菜单、空分区自动关闭、会话恢复
  - 验收：分屏稳定、右键操作覆盖要求、重启恢复

- M3 检索与索引
  - 全文索引、语义索引（本地 embedding）、增量更新、搜索面板
  - 验收：新增/修改笔记可被检索；Top-K 命中合理

- M4 RAG 问答与纠错提醒
  - LLM 提供者抽象、RAG 流程、纠错/遗漏建议面板
  - 验收：本地命中优先；缺失时由 LLM 辅助；建议列表准确可操作

- M5 艾宾浩斯复习系统
  - 计划生成、打分策略、今日复习、系统通知
  - 验收：计划计算正确；提醒与延后生效；统计可视化

- M6 插件系统
  - manifest、生命周期、设置面板、挂载点（侧栏图标/右侧栏/命令）
  - 验收：示例插件可安装启用、拥有设置、可注册图标与右侧视图

---

## 15. 风险与规避
- 本地 LLM 体积/性能：默认“仅语义检索+RAG，无 LLM 时禁用回答与纠错”，提供一键连接 `Ollama`
- 大型知识库索引速度：增量索引 + 并发限制 + 进度与暂停
- 插件安全：受限 API + 沙箱上下文 + 最小权限
- 数据一致性：原子写 + 冲突检测 + 自动快照
- 多语言与键盘布局：快捷键本地化映射/覆盖

---

## 16. 关键数据与接口（摘要）

### 16.1 语义索引条目
```json
{
  "id": "file.md#p12",
  "file": "notes/topic/file.md",
  "headingPath": ["并发模型", "锁与原子性"],
  "offset": 1234,
  "text": "……",
  "embedding": [0.012, -0.034, ...]
}
```

### 16.2 SRS 条目
```json
{
  "id": "file.md#h2-p3",
  "type": "paragraph",
  "nextReviewAt": "2025-09-18T09:00:00Z",
  "history": [{ "at": "2025-09-17", "grade": "Good" }],
  "ease": 2.5,
  "intervalDays": 4
}
```

### 16.3 插件主入口（TS 形状，供文档参考）
```ts
export interface PluginContext {
  app: AppAPI;
  settings: Record<string, any>;
  i18n: (key: string, params?: Record<string, any>) => string;
  onUnload(cb: () => void): void;
}

export default function onload(ctx: PluginContext) {
  // 注册 UI / 命令 / 存储等
  // ctx.app.registerRightPanel({...})
}
```

---

## 17. 开发约定
- 统一使用 `t('...')` 获取文案，不在模板中硬编码中文/英文
- Tailwind 仅用于布局与快速样式，主题变量抽象在 CSS 变量中
- 组件名、Store 名、IPC Channel 名统一前缀：`mn-`（MemoryNote）
- 文件换行与缩进遵循现有项目风格；避免大范围无意义格式化

---

请确认这份开发文档是否符合你的预期，是否需要在某些模块上加深或裁剪（例如语义索引实现细节、插件安全模型、分屏布局技术选型等）。确认后我将按里程碑开始实现，优先完成基础布局、设置自动保存、i18n、标签页与左侧目录树，并搭建索引与插件系统的骨架。





