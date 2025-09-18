<template>
  <div v-if="node.type === 'split'" ref="splitRef" class="h-full w-full overflow-hidden flex" :class="{ 'flex-row': node.dir==='row', 'flex-col': node.dir==='col' }">
    <div class="min-w-0 min-h-0" :style="paneStyle(0)">
      <EditorGroup :node="node.children[0]" />
    </div>
    <div class="border-l border-t border-slate-200 dark:border-slate-700" />
    <!-- Resizer -->
    <div
      class="no-drag"
      :class="node.dir==='row' ? 'w-1 cursor-col-resize hover:bg-slate-300/40' : 'h-1 cursor-row-resize hover:bg-slate-300/40'"
      @mousedown="onSplitResizeStart"
    />
    <div class="min-w-0 min-h-0" :style="paneStyle(1)">
      <EditorGroup :node="node.children[1]" />
    </div>
  </div>
  <div v-else class="h-full w-full overflow-hidden flex flex-col" @mousedown.capture="ensureActiveLeaf">
    <TabsBarGroup :leafId="node.id" />
    <div class="flex-1 overflow-auto">
      <div v-if="!active" class="p-4 text-neutral-500">No tab opened</div>
      <div v-else class="h-full flex flex-col">
        <component v-if="active.view" :is="viewComponent" class="flex-1" />
        <textarea v-else ref="taRef" class="flex-1 w-full outline-none p-4 bg-transparent" :style="editorStyle" v-model="activeContent" @keyup="onCursor" @click="onCursor" @focus="ensureActiveLeaf" @scroll.passive="onScroll"></textarea>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, nextTick } from 'vue';
import { storeToRefs } from 'pinia';
import { useTabGroupsStore } from '../../stores/tabgroups';
import { useEditorStore } from '../../stores/editor';
import { useSettingsStore } from '../../stores/settings';
import TabsBarGroup from './TabsBarGroup.vue';
import HomePanel from './HomePanel.vue';
import SubscriptionsPanel from './SubscriptionsPanel.vue';
import JournalPanel from './JournalPanel.vue';
import SettingsPanel from './SettingsPanel.vue';

const props = defineProps<{ node: any }>();
const groupsStore = useTabGroupsStore();
const active = computed(() => {
  if (props.node?.type !== 'leaf') return null;
  const leaf = groupsStore.findLeaf(props.node.id);
  if (!leaf) return null;
  return leaf.items.find(i => i.id === leaf.activeId) || null;
});
const activeContent = computed<string>({
  get() {
    return active.value?.content ?? '';
  },
  set(val: string) {
    if (active.value && props.node?.type === 'leaf') {
      groupsStore.setContent(props.node.id, active.value.id, val);
      editor.updateWordCount(val);
      editor.maybeAutosave();
    }
  }
});
const editor = useEditorStore();
const taRef = ref<HTMLTextAreaElement | null>(null);
const settings = useSettingsStore();
const editorStyle = computed(() => ({
  fontSize: (settings.data?.editor?.fontSize || 14) + 'px',
  lineHeight: String(settings.data?.editor?.lineHeight || 1.6)
}));

const viewComponent = computed(() => {
  const v = active.value?.view;
  if (v === 'home') return HomePanel;
  if (v === 'subscriptions') return SubscriptionsPanel;
  if (v === 'journal') return JournalPanel;
  if (v === 'settings') return SettingsPanel;
  return null as any;
});

function paneStyle(idx: number) {
  if (props.node?.type !== 'split') return {};
  const sizes = props.node.sizes || [1, 1];
  const a = sizes[idx] || 1;
  return props.node.dir === 'row' ? { flex: `${a} 1 0` } : { flex: `${a} 1 0` };
}

const splitRef = ref<HTMLDivElement | null>(null);
function onSplitResizeStart(e: MouseEvent) {
  if (props.node?.type !== 'split') return;
  const dir = props.node.dir;
  const box = splitRef.value?.getBoundingClientRect();
  if (!box) return;
  const sizes = props.node.sizes || [1, 1];
  const total = sizes[0] + sizes[1] || 2;
  const ratio0 = sizes[0] / total;
  function onMove(ev: MouseEvent) {
    if (dir === 'row') {
      const dx = ev.clientX - box.left;
      const r = Math.min(Math.max(dx / box.width, 0.05), 0.95);
      props.node.sizes = [r, 1 - r];
    } else {
      const dy = ev.clientY - box.top;
      const r = Math.min(Math.max(dy / box.height, 0.05), 0.95);
      props.node.sizes = [r, 1 - r];
    }
  }
  function onUp() {
    window.removeEventListener('mousemove', onMove);
    window.removeEventListener('mouseup', onUp);
  }
  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onUp);
}

// 将当前组件对应的叶子设为“工作标签区”
function ensureActiveLeaf() {
  if (props.node?.type === 'leaf') {
    const leaf = groupsStore.findLeaf(props.node.id);
    if (leaf) {
      groupsStore.activeLeafId = leaf.id;
    }
  }
}

watch(active, async (a) => {
  await nextTick();
  if (a && taRef.value) {
    if (typeof a.cursorOffset === 'number') {
      taRef.value.selectionStart = taRef.value.selectionEnd = a.cursorOffset;
    }
    if (typeof a.scrollTop === 'number') {
      taRef.value.scrollTop = a.scrollTop;
    }
  }
}, { immediate: true });

// 输入逻辑由 activeContent 的 setter 处理

function onCursor(e: Event) {
  const ta = e.target as HTMLTextAreaElement;
  const start = ta.selectionStart || 0;
  const toStart = ta.value.slice(0, start);
  const lines = toStart.split(/\n/);
  const line = lines.length;
  const col = lines[lines.length - 1].length + 1;
  editor.updateCursor(line, col);
  if (active.value) active.value.cursorOffset = start;
}

function onScroll(e: Event) {
  const ta = e.target as HTMLTextAreaElement;
  if (active.value) active.value.scrollTop = ta.scrollTop;
}
</script>


