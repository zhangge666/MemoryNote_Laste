import { defineStore } from 'pinia';

export interface SemanticHit {
  id: string;
  file: string;
  text: string;
  score: number;
}

export const useSearchStore = defineStore('search', {
  state: () => ({
    fulltext: [] as Array<{ file: string; line: number; preview: string }>,
    semantic: [] as SemanticHit[],
    answer: '' as string,
    loading: false,
  }),
  actions: {
    async runFulltext(q: string) {
      this.loading = true;
      try { this.fulltext = await window.mn.ipc.invoke('search:fulltext', q); } finally { this.loading = false; }
    },
    async rebuildIndex() {
      this.loading = true;
      try { return await window.mn.ipc.invoke('index:rebuild'); } finally { this.loading = false; }
    },
    async runSemantic(q: string) {
      this.loading = true;
      try { this.semantic = await window.mn.ipc.invoke('search:semantic', q); } finally { this.loading = false; }
    },
    async ask(question: string) {
      this.loading = true;
      try {
        const res = await window.mn.ipc.invoke('rag:ask', question);
        this.answer = res.answer;
        this.semantic = res.contexts || [];
      } finally { this.loading = false; }
    },
  }
});





