import { defineStore } from 'pinia';

export interface AppSettings {
  workspacePath: string;
  language: string;
  theme: 'system' | 'light' | 'dark';
  editor: { fontSize: number; lineHeight: number; autosave: 'off' | 'afterDelay' };
  search: { provider: 'local'; topK: number };
  llm: { provider: string; baseURL: string; model: string };
}

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    loading: false as boolean,
    data: null as AppSettings | null,
  }),
  actions: {
    async load() {
      this.loading = true;
      try {
        const res = await window.mn.ipc.invoke('settings:get');
        this.data = res as AppSettings;
      } finally {
        this.loading = false;
      }
    },
    async update(partial: Partial<AppSettings>) {
      // Ensure sending a plain, cloneable object (strip Vue proxies)
      const plain = JSON.parse(JSON.stringify(partial));
      const next = await window.mn.ipc.invoke('settings:set', plain);
      this.data = next as AppSettings;
    },
  },
});


