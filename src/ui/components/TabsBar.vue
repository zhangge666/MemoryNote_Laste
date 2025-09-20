<template>
  <div class="h-10 border-b border-surface-200 dark:border-surface-700 flex items-center gap-1 px-2 overflow-hidden bg-white dark:bg-surface-800">
    <div 
      v-for="tab in items" 
      :key="tab.id" 
      class="group px-3 h-8 flex items-center rounded-lg cursor-pointer transition-all duration-200 hover:bg-surface-100 dark:hover:bg-surface-700" 
      :class="{ 
        'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-700': tab.id === activeId,
        'text-surface-600 dark:text-surface-400': tab.id !== activeId
      }" 
      @click="setActive(tab.id)"
    >
      <span class="truncate max-w-[200px] text-sm font-medium">{{ tab.title }}</span>
      <button 
        class="ml-2 w-4 h-4 rounded-sm flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 hover:bg-surface-200 dark:hover:bg-surface-600 transition-all" 
        @click.stop="close(tab.id)"
        :class="tab.id === activeId ? 'text-primary-600 dark:text-primary-400' : 'text-surface-500'"
      >
        ×
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useTabGroupsStore } from '../../stores/tabgroups';

const tabs = useTabGroupsStore();
const activeLeaf = computed(() => tabs.findLeaf(tabs.activeLeafIdOrRoot));
const items = computed(() => activeLeaf.value?.items || []);
const activeId = computed(() => activeLeaf.value?.activeId || '');

function setActive(id: string) {
  if (activeLeaf.value) {
    tabs.setActive(activeLeaf.value.id, id);
  }
}

function close(id: string) {
  if (activeLeaf.value) {
    tabs.close(activeLeaf.value.id, id);
  }
}
</script>





