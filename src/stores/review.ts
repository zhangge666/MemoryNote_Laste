import { defineStore } from 'pinia';

export interface ReviewItem {
	id: string;
	title: string;
	path?: string; // optional link to a note
	content: string;
	nextReviewAt: number; // epoch ms
	interval: number; // days
	ease: number; // SM-2 ease factor
	repetitions: number;
}

function generateId() {
	try { return crypto.randomUUID(); } catch { return Math.random().toString(36).slice(2); }
}

export const useReviewStore = defineStore('review', {
	state: () => ({
		items: [] as ReviewItem[],
		queue: [] as string[],
		loading: false as boolean,
		persistAvailable: typeof window !== 'undefined' && (window as any).mn?.review ? true : false,
		suggestions: [] as Array<{ path: string; start: number; end: number; text: string }>,
	}),
	getters: {
		dueItems(state): ReviewItem[] {
			const now = Date.now();
			return state.items.filter(i => i.nextReviewAt <= now).sort((a,b) => a.nextReviewAt - b.nextReviewAt);
		},
		current(state): ReviewItem | null {
			const id = state.queue[0];
			return state.items.find(i => i.id === id) || null;
		}
	},
	actions: {
		async init() {
			if (!this.persistAvailable) return;
			try { await (window as any).mn.review.init(); } catch {}
		},
		async loadAll() {
			if (this.persistAvailable) {
				this.loading = true;
				try {
					const rows = await (window as any).mn.review.listAll();
					this.items = (rows || []).map((r: any) => ({
						id: r.id,
						title: r.title,
						content: r.content,
						path: r.path || undefined,
						nextReviewAt: Number(r.next_review_at ?? r.nextReviewAt ?? Date.now()),
						interval: Number(r.interval_days ?? r.interval ?? 0),
						ease: Number(r.ease ?? 2.5),
						repetitions: Number(r.repetitions ?? 0),
					}));
				} finally {
					this.loading = false;
				}
			}
		},
		buildQueue() {
			this.queue = this.dueItems.map((i: ReviewItem) => i.id);
		},
		async seedMock() {
			if (this.persistAvailable) {
				await (window as any).mn.review.seedMock();
				await this.loadAll();
				this.buildQueue();
				return;
			}
			if (this.items.length > 0) return;
			const now = Date.now();
			this.items = Array.from({ length: 8 }).map((_, i) => ({
				id: generateId(),
				title: `卡片 ${i+1}`,
				content: `这是第 ${i+1} 张复习卡片的正反面内容示例。`,
				nextReviewAt: now - (i%3)*3600_000,
				interval: 0,
				ease: 2.5,
				repetitions: 0,
			}));
		},
		async rate(quality: 0|1|2|3|4|5) {
			const cur = this.current; if (!cur) return;
			if (this.persistAvailable) {
				await (window as any).mn.review.rate(cur.id, quality);
				await this.loadAll();
				this.buildQueue();
				return;
			}
			const q = Math.max(0, Math.min(5, quality));
			if (q < 3) {
				cur.repetitions = 0;
				cur.interval = 1;
			} else {
				const ef = cur.ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
				cur.ease = Math.max(1.3, ef);
				cur.repetitions += 1;
				if (cur.repetitions === 1) cur.interval = 1;
				else if (cur.repetitions === 2) cur.interval = 6;
				else cur.interval = Math.round(cur.interval * cur.ease);
			}
			cur.nextReviewAt = Date.now() + cur.interval * 24 * 3600 * 1000;
			this.queue.shift();
		},
		skip() {
			const id = this.queue.shift();
			if (id) this.queue.push(id);
		},
		async addCard(payload: { title: string; content: string; path?: string }) {
			if (this.persistAvailable) {
				await (window as any).mn.review.addCard(payload);
				await this.loadAll();
				this.buildQueue();
				return;
			}
			const now = Date.now();
			this.items.push({
				id: generateId(),
				title: payload.title,
				content: payload.content,
				path: payload.path,
				nextReviewAt: now,
				interval: 0,
				ease: 2.5,
				repetitions: 0,
			});
		},
		// 根据笔记前后版本差异生成“卡片建议”（简化版：提取新增的非空行）
		suggestFromDiff(path: string, before: string, after: string) {
      // Debug aid
      try { console.log('[ReviewSuggest] start', { path, bl: before.length, al: after.length }); } catch {}
			// 1) 用 diff-match-patch 做字符级/词级差异
			let addedSpans: Array<{ text: string }>= [];
			try {
				// 延迟加载以减小渲染负担
				// eslint-disable-next-line @typescript-eslint/no-var-requires
				const DMP = require('diff-match-patch');
				const dmp = new DMP.diff_match_patch();
				const diffs = dmp.diff_main(before, after);
				dmp.diff_cleanupSemantic(diffs);
				let buf = '';
				for (const [op, data] of diffs as Array<[number, string]>) {
					if (op === 1) buf += data; // 增加
					else { if (buf.trim()) { addedSpans.push({ text: buf }); } buf = ''; }
				}
				if (buf.trim()) addedSpans.push({ text: buf });
			} catch {}

			// 2) 用 remark 解析 Markdown，优先从段落/列表/标题中提取新增文本片段
			try {
				// eslint-disable-next-line @typescript-eslint/no-var-requires
				const { unified } = require('unified');
				// eslint-disable-next-line @typescript-eslint/no-var-requires
				const remarkParse = require('remark-parse');
				const tree = unified().use(remarkParse).parse(after);
				// 遍历段落/标题/列表项节点，递归提取文本
				const paragraphs: string[] = [];
				function extractText(n: any): string {
					if (!n) return '';
					if (typeof n.value === 'string') return n.value;
					let out = '';
					if (Array.isArray(n.children)) for (const c of n.children) out += extractText(c);
					return out;
				}
				function walk(n: any) {
					if (n.type === 'paragraph' || n.type === 'heading' || n.type === 'listItem') {
						const txt = extractText(n).trim();
						if (txt) paragraphs.push(txt);
					}
					if (Array.isArray(n.children)) n.children.forEach(walk);
				}
				walk(tree);
				const addedSet = new Set(addedSpans.map(s => s.text.trim()));
				const candidates = paragraphs.filter(p => p.length >= 8 && p.length <= 300 && (addedSet.size === 0 || Array.from(addedSet).some(a => {
					const k = a.trim();
					if (!k) return false;
					const probe = k.slice(0, Math.min(16, k.length));
					return p.includes(probe);
				})));
				const seen = new Set<string>();
				let sugg = candidates.filter(c => !seen.has(c) && (seen.add(c), true))
					.map(text => ({ path, start: 0, end: 0, text }));
				// 若仍为空，回退到“行级 diff”：取 after 的行集中在 before 中不存在的行
				if (sugg.length === 0) {
					const beforeSet = new Set(before.split(/\r?\n/).map((s: string) => s.trim()).filter(Boolean));
					const lineAdds = after.split(/\r?\n/).map((s: string) => s.trim()).filter(s => s && !beforeSet.has(s));
					const seen2 = new Set<string>();
					sugg = lineAdds.filter(s => s.length >= 8 && s.length <= 300 && !seen2.has(s) && (seen2.add(s), true)).map(text => ({ path, start: 0, end: 0, text }));
				}
				this.suggestions = sugg;
			} catch {
				// 回退：按新增 span 直接给建议
				const seen = new Set<string>();
				this.suggestions = addedSpans.map(s => s.text.trim()).filter(t => t.length >= 8 && t.length <= 300 && !seen.has(t) && (seen.add(t), true)).map(text => ({ path, start: 0, end: 0, text }));
			}

			// 3) 仍为空：用 LCP/LCS 提取插入中段作为候选
			if (!this.suggestions || this.suggestions.length === 0) {
				function lcp(a: string, b: string): number { const n = Math.min(a.length, b.length); let i=0; while (i<n && a.charCodeAt(i)===b.charCodeAt(i)) i++; return i; }
				function lcs(a: string, b: string): number { const ra=[...a].reverse().join(''); const rb=[...b].reverse().join(''); const n = Math.min(ra.length, rb.length); let i=0; while (i<n && ra.charCodeAt(i)===rb.charCodeAt(i)) i++; return i; }
				const p = lcp(before, after);
				const s = lcs(before.slice(p), after.slice(p));
				const mid = after.slice(p, after.length - s);
				const lines = mid.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
				const seen3 = new Set<string>();
				const extra = lines.filter(x => x.length >= 8 && x.length <= 300 && !seen3.has(x) && (seen3.add(x), true)).map(text => ({ path, start: 0, end: 0, text }));
				if (extra.length > 0) this.suggestions = extra;
			}
			try { console.log('[ReviewSuggest] out', { count: this.suggestions?.length || 0 }); } catch {}
		},
		clearSuggestions() { this.suggestions = []; },
		async acceptSuggestion(s: { path: string; text: string }) {
			await this.addCard({ title: s.text.slice(0,60), content: s.text, path: s.path });
		}
		,
		// 修改/删除处理：输入 before/after 与指定文件，尝试重锚并更新/归档
		async reconcileForFile(path: string, before: string, after: string) {
			try {
				const anchors = await (window as any).mn.review?.anchorsByPath?.(path) || [];
				for (const a of anchors) {
					// 重锚：优先 exact 匹配其原内容；否则用上下文 before/after 近邻匹配；失败则标记漂移
					const exactIdx = after.indexOf(a.hash && typeof a.hash==='string' ? a.hash : '');
					let start = exactIdx >= 0 ? exactIdx : -1;
					let end = start >= 0 ? start + String(a.hash||'').length : -1;
					if (start < 0 && a.anchor_before && a.anchor_after) {
						const left = after.indexOf(a.anchor_before);
						if (left >= 0) {
							const right = after.indexOf(a.anchor_after, left + a.anchor_before.length);
							if (right > left) { start = left + a.anchor_before.length; end = right; }
						}
					}
					if (start >= 0 && end >= 0 && end > start) {
						// 更新锚点位置
						await (window as any).mn.review?.setAnchor?.({ cardId: a.card_id, path, start, end });
						// 若内容发生替换（before 中该范围的文本不同且 after 存在新文本），更新卡片内容
						const newText = after.slice(start, end).trim();
						if (newText && typeof (window as any).mn.review?.updateCardContent === 'function') {
							await (window as any).mn.review.updateCardContent(a.card_id, newText);
						}
					} else {
						// 删除或无法重锚：归档该卡片（待确认可在 UI 提示）
						await (window as any).mn.review?.setCardArchived?.(a.card_id, true);
					}
				}
			} catch (e) {
				try { console.warn('[ReviewReconcile] failed', e); } catch {}
			}
		}
		,
		// Cloud actions
		async cloudPushAll(): Promise<{ ok: boolean; error?: string }> {
			try { return await (window as any).mn.ipc.invoke('cloud:review:pushAll'); } catch (e: any) { return { ok: false, error: String(e?.message||e) }; }
		},
		async cloudPullAll(): Promise<{ ok: boolean; error?: string }> {
			try {
				const res = await (window as any).mn.ipc.invoke('cloud:review:pullAll');
				if (res?.ok) { await this.loadAll(); this.buildQueue(); }
				return res;
			} catch (e: any) { return { ok: false, error: String(e?.message||e) }; }
		}
	}
});


