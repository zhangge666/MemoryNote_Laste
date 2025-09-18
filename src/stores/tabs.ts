import { defineStore } from 'pinia';

export interface TabItem {
  id: string;
  title: string;
  path?: string;
  content?: string;
  dirty?: boolean;
}

export const useTabsStore = defineStore('tabs', {
  state: () => ({
    items: [] as TabItem[],
    activeId: '' as string,
  }),
  getters: {
    active(state) {
      return state.items.find(i => i.id === state.activeId) || null;
    },
  },
  actions: {
    open(item: Omit<TabItem, 'id'>) {
      const id = crypto.randomUUID();
      const tab: TabItem = { id, ...item };
      this.items.push(tab);
      this.activeId = id;
      return tab;
    },
    close(id: string) {
      const idx = this.items.findIndex(i => i.id === id);
      if (idx >= 0) {
        this.items.splice(idx, 1);
        if (this.activeId === id) {
          this.activeId = this.items[idx]?.id || this.items[idx - 1]?.id || '';
        }
      }
    },
    setActive(id: string) {
      this.activeId = id;
    },
    setContent(id: string, content: string) {
      const tab = this.items.find(i => i.id === id);
      if (tab) {
        tab.content = content;
        tab.dirty = true;
      }
    },
  }
});





