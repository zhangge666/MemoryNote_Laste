import { defineStore } from 'pinia';
import { useTabGroupsStore, type LayoutNode } from './tabgroups';

export const useSessionStore = defineStore('session', {
  actions: {
    serialize() {
      const tg = useTabGroupsStore();
      const payload = {
        root: tg.root,
        activeLeafId: tg.activeLeafIdOrRoot,
      };
      // Ensure plain, cloneable object (strip Vue proxies, functions, symbols)
      try {
        return JSON.parse(JSON.stringify(payload));
      } catch {
        return payload as unknown as { root: LayoutNode; activeLeafId: string };
      }
    },
    async save() {
      try {
        const data = this.serialize();
        // Defensive: make sure the object is structured-cloneable for IPC
        const plain = JSON.parse(JSON.stringify(data));
        await window.mn.ipc.invoke('session:set', plain);
      } catch (err) {
        console.error('session.save failed', err);
      }
    },
    async restore() {
      const data = await window.mn.ipc.invoke('session:get');
      if (!data) return;
      const tg = useTabGroupsStore();
      if (data.root) tg.root = data.root as LayoutNode;
      if (data.activeLeafId) tg.activeLeafId = data.activeLeafId;
    }
  }
});


