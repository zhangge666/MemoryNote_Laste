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
      try {
        await window.mn.ipc.invoke('file:write', active.path, active.content || '');
      } catch {
        // Ignore writes outside workspace
      }
      active.dirty = false;
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


