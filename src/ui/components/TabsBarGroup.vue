<template>
<div class="h-9 border-b flex items-center gap-1 px-1 overflow-hidden select-none relative"
     @click.self="menuOpen=false"
     @dragover.prevent="onContainerDragOver"
     @drop="onContainerDrop">
    <div class="flex items-center gap-1 pr-2 border-r mr-1">
      <button class="px-1 text-xs hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded" @click="splitRight" title="分屏到右侧 (Shift 在另一叶打开)">⇢</button>
      <button class="px-1 text-xs hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded" @click="splitDown" title="分屏到下方 (Shift 在另一叶打开)">⇣</button>
    </div>
    <div v-for="(tab, idx) in leaf.items" :key="tab.id"
         class="px-2 h-7 flex items-center rounded cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-700"
         :class="{ 'bg-neutral-200 dark:bg-neutral-700': tab.id === leaf.activeId }"
         @click="setActive(leafId, tab.id)"
         draggable="true"
         @dragstart="onDragStart($event, idx)"
         @dragover.prevent
         @drop="onDrop($event, idx)"
         @contextmenu.prevent.stop="openMenu($event, tab.id)">
      <span class="truncate max-w-[200px]">{{ tab.title }}</span>
      <span v-if="tab.dirty" class="ml-1 text-amber-500">●</span>
      <button class="ml-2 text-neutral-500 hover:text-neutral-800" @click.stop="close(leafId, tab.id)">×</button>
    </div>
    <!-- click-away overlay -->
    <div v-if="menuOpen" class="fixed inset-0 z-[9998]" @click="menuOpen=false"></div>
    <!-- context menu (fixed to avoid clipping by overflow) -->
    <div v-if="menuOpen" class="fixed z-[9999] bg-white dark:bg-neutral-800 border rounded shadow text-sm min-w-[160px]" :style="{ left: menuX+'px', top: menuY+'px' }">
      <div class="px-3 py-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer" @click="close(leafId, menuTabId); menuOpen=false">Close</div>
      <div class="px-3 py-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer" @click="closeOthers(leafId, menuTabId); menuOpen=false">Close Others</div>
      <div class="px-3 py-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer" @click="splitTabTo(menuTabId, 'row'); menuOpen=false">Open to Right</div>
      <div class="px-3 py-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer" @click="splitTabTo(menuTabId, 'col'); menuOpen=false">Open to Bottom</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useTabGroupsStore } from '../../stores/tabgroups';

const props = defineProps<{ leafId: string }>();
const store = useTabGroupsStore();
const leaf = computed(() => store.findLeaf(props.leafId) || { id: props.leafId, items: [], activeId: '' } as any);

const { setActive, close, closeOthers, moveTab, duplicateTabTo, splitLeafTo } = store as any;
const menuOpen = ref(false);
// drag & drop state
const drag = ref<{ fromLeafId: string; tabId: string; fromIndex: number } | null>(null);

function onDragStart(e: DragEvent, idx: number) {
  const tab = leaf.value.items[idx];
  if (!tab) return;
  drag.value = { fromLeafId: props.leafId, tabId: tab.id, fromIndex: idx };
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/json', JSON.stringify(drag.value));
    e.dataTransfer.setData('text/plain', tab.id);
    // transparent drag image
    e.dataTransfer.setDragImage(new Image(), 0, 0);
  }
}

function onDrop(e: DragEvent, toIndex: number) {
  const data = e.dataTransfer?.getData('application/json') || e.dataTransfer?.getData('text/plain');
  try {
    const d = data ? JSON.parse(data) : drag.value;
    if (!d) return;
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
    moveTab(d.fromLeafId, props.leafId, d.tabId, toIndex);
  } catch {}
  drag.value = null;
}

function onContainerDragOver(e: DragEvent) {
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
}

function onContainerDrop(e: DragEvent) {
  const data = e.dataTransfer?.getData('application/json') || e.dataTransfer?.getData('text/plain');
  try {
    const d = data ? JSON.parse(data) : drag.value;
    if (!d) return;
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
    // drop at end of this leaf's tabs
    moveTab(d.fromLeafId, props.leafId, d.tabId, leaf.value.items.length);
  } catch {}
  drag.value = null;
}
const menuX = ref(0);
const menuY = ref(0);
const menuTabId = ref('');

function splitRight() {
  splitActiveTo('row');
}
function splitDown() {
  splitActiveTo('col');
}

function openMenu(e: MouseEvent, id: string) {
  menuOpen.value = true;
  // Place by viewport to avoid clipping; adjust if near edges
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const padding = 8;
  const mx = (e as MouseEvent).clientX;
  const my = (e as MouseEvent).clientY;
  const estW = 180;
  const estH = 120;
  menuX.value = Math.min(mx, vw - estW - padding);
  menuY.value = Math.min(my, vh - estH - padding);
  menuTabId.value = id;
}

function splitActiveTo(dir: 'row' | 'col') {
  const activeId = leaf.value.activeId;
  // 执行分屏，并将当前激活标签移动到新叶
  splitLeafTo(props.leafId, dir);
  const newLeafId = store.activeLeafId; // splitLeafTo 会把新叶设为激活叶
  if (activeId) {
    // 只有一个标签时：在两个区域都打开同一标签（共享同一对象）
    const count = leaf.value.items.length;
    if (count <= 1) {
      duplicateTabTo(props.leafId, newLeafId, activeId);
    } else {
      moveTab(props.leafId, newLeafId, activeId);
    }
    setActive(newLeafId, activeId);
  }
}

function splitTabTo(tabId: string, dir: 'row' | 'col') {
  if (!tabId) return;
  splitLeafTo(props.leafId, dir);
  const newLeafId = store.activeLeafId;
  const count = leaf.value.items.length;
  if (count <= 1 || leaf.value.activeId === tabId) {
    duplicateTabTo(props.leafId, newLeafId, tabId);
  } else {
    moveTab(props.leafId, newLeafId, tabId);
  }
  setActive(newLeafId, tabId);
}
</script>


