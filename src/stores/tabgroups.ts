import { defineStore } from 'pinia';

export interface TabItem {
  id: string;
  title: string;
  path?: string;
  content?: string;
  dirty?: boolean;
  cursorOffset?: number;
  scrollTop?: number;
  // optional highlight/selection range in UTF-16 offsets
  selectionStart?: number;
  selectionEnd?: number;
  view?: 'home' | 'subscriptions' | 'journal' | 'settings';
}

export type SplitDir = 'row' | 'col';

export interface LeafNode {
  type: 'leaf';
  id: string;
  items: TabItem[];
  activeId: string;
}

export interface SplitNode {
  type: 'split';
  id: string;
  dir: SplitDir;
  children: LayoutNode[];
  sizes?: number[]; // relative flex sizes, e.g., [1,1]
}

export type LayoutNode = LeafNode | SplitNode;

function generateId() {
  // Use crypto if available (renderer), fallback for main-less contexts
  try {
    return crypto.randomUUID();
  } catch {
    return Math.random().toString(36).slice(2);
  }
}

export const useTabGroupsStore = defineStore('tabgroups', {
  state: () => ({
    root: { type: 'leaf', id: generateId(), items: [] as TabItem[], activeId: '' } as LayoutNode,
    activeLeafId: '' as string,
  }),
  getters: {
    activeLeafIdOrRoot(state): string {
      if (state.activeLeafId) return state.activeLeafId;
      return (state.root as LeafNode).type === 'leaf' ? (state.root as LeafNode).id : '';
    },
    activeTab(state): TabItem | null {
      const leaf = this.findLeaf(this.activeLeafIdOrRoot);
      if (!leaf) return null;
      return leaf.items.find((i: TabItem) => i.id === leaf.activeId) || null;
    },
  },
  actions: {
    findTabBy(predicate: (t: TabItem) => boolean): { leafId: string; tab: TabItem } | null {
      const leaves = this.listLeaves();
      for (const l of leaves) {
        const t = l.items.find(predicate);
        if (t) return { leafId: l.id, tab: t };
      }
      return null;
    },
    findLeaf(id: string): LeafNode | null {
      function walk(n: LayoutNode): LeafNode | null {
        if (n.type === 'leaf') return n.id === id ? n : null;
        for (const c of n.children) {
          const r = walk(c);
          if (r) return r;
        }
        return null;
      }
      return walk(this.root);
    },
    listLeaves(): LeafNode[] {
      const out: LeafNode[] = [];
      function walk(n: LayoutNode) {
        if (n.type === 'leaf') { out.push(n); return; }
        n.children.forEach(walk);
      }
      walk(this.root);
      return out;
    },
    getNextLeafId(currentId?: string): string {
      const leaves = this.listLeaves();
      if (leaves.length === 0) return '';
      const cur = currentId || this.activeLeafIdOrRoot;
      const idx = leaves.findIndex((l: LeafNode) => l.id === cur);
      const next = idx >= 0 ? (idx + 1) % leaves.length : 0;
      // if only one leaf, just return itself
      return leaves[next].id;
    },
    findLeafWithParent(id: string): { parent: SplitNode | null; index: number; leaf: LeafNode | null } {
      let parent: SplitNode | null = null; let index = -1; let found: LeafNode | null = null;
      function dfs(n: LayoutNode, p: SplitNode | null) {
        if (n.type === 'leaf') {
          if (n.id === id) { parent = p; found = n; }
          return;
        }
        n.children.forEach((c, i) => { if (!found) { index = i; dfs(c, n); if (found) index = i; } });
      }
      dfs(this.root, null);
      return { parent, index, leaf: found };
    },
    reset() {
      this.root = { type: 'leaf', id: generateId(), items: [], activeId: '' };
      this.activeLeafId = (this.root as LeafNode).id;
    },
    openInLeaf(leafId: string, item: Omit<TabItem, 'id'>) {
      // 全局去重：如果任何叶已有同 path 或 view，则激活那个标签
      const globalExisting = this.findTabBy((i: TabItem) => (item.path && i.path === item.path) || (item.view && i.view === item.view));
      if (globalExisting) {
        const { leafId: lid, tab } = globalExisting;
        const leafG = this.findLeaf(lid);
        if (leafG) {
          leafG.activeId = tab.id;
          this.activeLeafId = lid;
        }
        return tab;
      }
      const leaf = this.findLeaf(leafId);
      if (!leaf) return null;
      const existing = leaf.items.find((i: TabItem) => (item.path && i.path === item.path) || (item.view && i.view === item.view));
      if (existing) {
        leaf.activeId = existing.id;
        this.activeLeafId = leafId;
        return existing;
      }
      const id = generateId();
      const tab: TabItem = { id, ...item };
      leaf.items.push(tab);
      leaf.activeId = id;
      this.activeLeafId = leafId;
      return tab;
    },
    open(item: Omit<TabItem, 'id'>) {
      const leafId = this.activeLeafIdOrRoot;
      return this.openInLeaf(leafId, item);
    },
    setActive(leafId: string, id: string) {
      const leaf = this.findLeaf(leafId);
      if (!leaf) return;
      leaf.activeId = id;
      this.activeLeafId = leafId;
    },
    setContent(leafId: string, id: string, content: string) {
      const leaf = this.findLeaf(leafId);
      if (!leaf) return;
      const tab = leaf.items.find((i: TabItem) => i.id === id);
      if (tab) {
        tab.content = content;
        tab.dirty = true;
      }
    },
    setSelection(leafId: string, id: string, start: number, end: number) {
      const leaf = this.findLeaf(leafId);
      if (!leaf) return;
      const tab = leaf.items.find((i: TabItem) => i.id === id);
      if (tab) {
        tab.selectionStart = Math.max(0, Math.min(start, end));
        tab.selectionEnd = Math.max(0, Math.max(start, end));
      }
    },
    close(leafId: string, id: string) {
      const leaf = this.findLeaf(leafId);
      if (!leaf) return;
      const idx = leaf.items.findIndex((i: TabItem) => i.id === id);
      if (idx >= 0) {
        leaf.items.splice(idx, 1);
        if (leaf.activeId === id) {
          leaf.activeId = leaf.items[idx]?.id || leaf.items[idx - 1]?.id || '';
        }
      }
      this.prune();
    },
    closeOthers(leafId: string, id: string) {
      const leaf = this.findLeaf(leafId);
      if (!leaf) return;
      const keep = leaf.items.find((i: TabItem) => i.id === id);
      if (!keep) return;
      leaf.items = [keep];
      leaf.activeId = keep.id;
    },
    moveTab(fromLeafId: string, toLeafId: string, id: string, toPosition?: number) {
      const from = this.findLeaf(fromLeafId);
      const to = this.findLeaf(toLeafId);
      if (!from || !to) return;
      const idx = from.items.findIndex((i: TabItem) => i.id === id);
      if (idx < 0) return;
      const [tab] = from.items.splice(idx, 1);
      const pos = Math.max(0, Math.min(toPosition ?? to.items.length, to.items.length));
      to.items.splice(pos, 0, tab);
      to.activeId = tab.id;
      if (from.activeId === id) from.activeId = from.items[0]?.id || '';
      this.activeLeafId = toLeafId;
      this.prune();
    },
    duplicateTabTo(fromLeafId: string, toLeafId: string, id: string, toPosition?: number) {
      const from = this.findLeaf(fromLeafId);
      const to = this.findLeaf(toLeafId);
      if (!from || !to) return;
      const tab = from.items.find((i: TabItem) => i.id === id);
      if (!tab) return;
      const pos = Math.max(0, Math.min(toPosition ?? to.items.length, to.items.length));
      // Push the same object reference so content/state is shared across panes
      to.items.splice(pos, 0, tab);
      to.activeId = tab.id;
      this.activeLeafId = toLeafId;
    },
    splitLeafTo(leafId: string, direction: SplitDir) {
      // replace leaf with split node: [oldLeaf, newLeaf]
      const info = this.findLeafWithParent(leafId);
      const leaf = info.leaf; if (!leaf) return;
      const newLeaf: LeafNode = { type: 'leaf', id: generateId(), items: [], activeId: '' };
      const split: SplitNode = { type: 'split', id: generateId(), dir: direction, children: [leaf, newLeaf], sizes: [1, 1] };
      if (!info.parent) {
        this.root = split;
      } else {
        info.parent.children[info.index] = split;
      }
      this.activeLeafId = newLeaf.id;
    },
    findSplit(id: string): SplitNode | null {
      function walk(n: LayoutNode): SplitNode | null {
        if (n.type === 'split') {
          if (n.id === id) return n;
          for (const c of n.children) {
            const r = walk(c);
            if (r) return r;
          }
        }
        return null;
      }
      return walk(this.root);
    },
    setSplitSizes(splitId: string, sizes: number[]) {
      const s = this.findSplit(splitId);
      if (!s) return;
      const sum = sizes.reduce((a, b) => a + b, 0) || 1;
      s.sizes = sizes.map(v => (v <= 0 ? 0.0001 : v))
        .map(v => v / sum);
    },
    prune() {
      function collapse(node: LayoutNode): LayoutNode {
        if (node.type === 'leaf') return node;
        node.children = node.children.map(c => collapse(c));
        // remove empty leaf if sibling has items
        if (node.children.length === 2) {
          const [a, b] = node.children;
          const aEmpty = a.type === 'leaf' && a.items.length === 0;
          const bEmpty = b.type === 'leaf' && b.items.length === 0;
          if (aEmpty && !bEmpty) return b;
          if (bEmpty && !aEmpty) return a;
          // if both are empty leaves, collapse to a single empty leaf
          if (aEmpty && bEmpty) return a;
        }
        // if child is split and the other is empty leaf, handled above; also flatten single-child split
        if (node.children.length === 1) return node.children[0];
        return node;
      }
      this.root = collapse(this.root);
      // ensure activeLeafId points to an existing leaf
      const current = this.findLeaf(this.activeLeafId);
      if (!current) {
        // pick first leaf in tree
        function firstLeaf(n: LayoutNode): LeafNode {
          if (n.type === 'leaf') return n;
          return firstLeaf(n.children[0]);
        }
        const l = firstLeaf(this.root);
        this.activeLeafId = l.id;
      }
    },
  },
});


