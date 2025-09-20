<template>
  <div v-if="(node as any).type === 'dir'" class="select-none">
    <div
      class="flex items-center px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors"
      @click="toggle"
      @contextmenu.prevent="onContext($event, (node as any).path)"
    >
      <svg class="w-4 h-4 mr-2 text-slate-500" :class="{ 'rotate-90': expanded }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
      <svg class="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
      <span class="text-sm font-medium text-slate-700 dark:text-slate-300">{{ (node as any).name }}</span>
    </div>
    <div v-show="expanded" class="ml-6">
      <TreeNode
        v-for="child in (node as any).children"
        :key="child.path"
        :node="child"
        @open-file="$emit('open-file', $event)"
        @context-menu="$emit('context-menu', $event, arguments[1])"
      />
    </div>
  </div>
  <div v-else class="flex items-center px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors select-none"
       @click="onOpen((node as any).path, $event)"
       @dblclick="onOpen((node as any).path, $event)"
       @contextmenu.prevent="onContext($event, (node as any).path)">
    <div class="w-4 h-4 mr-2"></div>
    <svg class="w-4 h-4 mr-2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
    <span class="text-sm text-slate-600 dark:text-slate-400">{{ (node as any).name }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

defineProps<{ node: any }>();
const emit = defineEmits<{
  (e: 'open-file', path: string, event?: MouseEvent): void
  (e: 'context-menu', event: MouseEvent, path: string): void
}>();

const expanded = ref(true);
function toggle() { expanded.value = !expanded.value; }
function onOpen(path: string, e?: MouseEvent) { emit('open-file', path, e); }
function onContext(e: MouseEvent, path: string) { emit('context-menu', e, path); }
</script>


