import { defineStore } from 'pinia';
import { useTabGroupsStore } from './tabgroups';
import { useSettingsStore } from './settings';

export const useEditorStore = defineStore('editor', {
  state: () => ({
    lastSnapshotAt: 0 as number,
    snapshotIntervalMs: 3000,
    cursorLine: 1 as number,
    cursorColumn: 1 as number,
    wordCount: 0 as number,
    _autosaveTimer: null as any,
  }),
  actions: {
    async snapshotActive() {
      const groups = useTabGroupsStore();
      const settings = useSettingsStore();
      const active = groups.activeTab as any;
      if (!active || !active.path) return;
      const ws = settings.data?.workspacePath || '';
      if (ws && !active.path.startsWith(ws)) return;
      const now = Date.now();
      if (now - this.lastSnapshotAt < this.snapshotIntervalMs) return;
      this.lastSnapshotAt = now;
      try {
        await window.mn.ipc.invoke('file:snapshot', active.path, active.content || '');
      } catch {
        // Ignore snapshot errors (e.g., outside workspace)
      }
    },
    async saveActive() {
      const groups = useTabGroupsStore();
      const settings = useSettingsStore();
      const active = groups.activeTab as any;
      if (!active || !active.path) return;
      const ws = settings.data?.workspacePath || '';
      if (ws && !active.path.startsWith(ws)) return;
      
      // 读取保存前磁盘文本
      let beforeText = '';
      try {
        beforeText = String(await window.mn.ipc.invoke('file:read', active.path));
      } catch (e) {
        console.warn('[ReviewDiff] read before failed:', e);
      }
      try {
        await window.mn.ipc.invoke('file:write', active.path, active.content || '');
      } catch {
        // Ignore writes outside workspace
      }
      active.dirty = false;
      //复习diff
      try {
        const afterText = String(active.content || '');
        const { useReviewStore } = await import('./review');
        const review = useReviewStore();
        const mode = settings.data?.review?.autoMode || 'manual';
        console.log('[ReviewDiff] saveActive path:', active.path, 'mode:', mode, 'before.len:', beforeText.length, 'after.len:', afterText.length);
        review.suggestFromDiff(active.path, beforeText, afterText);
        console.log('[ReviewDiff] suggestions generated:', review.suggestions.length);
        // 对已有锚点的卡片执行重锚/更新/归档
        await review.reconcileForFile(active.path, beforeText, afterText);
        // 根据设置的自动模式自动处理
        if (mode !== 'manual' && review.suggestions.length > 0) {
          const isTagged = (s: { text: string }) => /(@card|@@review)/i.test(s.text);
          const list = mode === 'auto-all' ? [...review.suggestions] : review.suggestions.filter(isTagged);
          let accepted = 0;
          for (const s of list) {
            await review.acceptSuggestion({ path: s.path, text: s.text });
            accepted++;
          }
          if (mode === 'auto-all') review.clearSuggestions();
          else review.suggestions = review.suggestions.filter(s => !isTagged(s));
          console.log('[ReviewDiff] auto accepted:', accepted);
        }
      } catch (e) {
        console.error('[ReviewDiff] error during suggest/auto-accept:', e);
      }
    },
    updateCursor(line: number, column: number) {
      this.cursorLine = line;
      this.cursorColumn = column;
    },
    updateWordCount(text: string) {
      const words = (text || '').trim().split(/\s+/).filter(Boolean);
      this.wordCount = words.length;
    },
    maybeAutosave() {
      const groups = useTabGroupsStore();
      const active = groups.activeTab as any;
      if (!active || !active.path) return;
      // read autosave mode from settings via window IPC (cheap read)
      window.mn.ipc.invoke('settings:get').then((s: any) => {
        if (s?.editor?.autosave === 'afterDelay') {
          if (this._autosaveTimer) clearTimeout(this._autosaveTimer);
          this._autosaveTimer = setTimeout(() => {
            this.saveActive();
          }, 1200);
        }
      });
    }
  }
});


