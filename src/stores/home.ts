import { defineStore } from 'pinia';

export const useHomeStore = defineStore('home', {
  state: () => ({
    files: 0,
    dirs: 0,
    recent: [] as Array<{ file: string; mtime: number }>,
    loading: false,
  }),
  actions: {
    async load() {
      this.loading = true;
      try {
        const res = await window.mn.ipc.invoke('workspace:stats');
        this.files = res.files; this.dirs = res.dirs; this.recent = res.recent;
      } finally { this.loading = false; }
    }
  }
});





