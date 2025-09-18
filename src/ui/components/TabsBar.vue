<template>
  <div class="h-9 border-b flex items-center gap-1 px-1 overflow-hidden">
    <div v-for="tab in items" :key="tab.id" class="px-2 h-7 flex items-center rounded cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-700" :class="{ 'bg-neutral-200 dark:bg-neutral-700': tab.id === activeId }" @click="setActive(tab.id)">
      <span class="truncate max-w-[200px]">{{ tab.title }}</span>
      <button class="ml-2 text-neutral-500 hover:text-neutral-800" @click.stop="close(tab.id)">×</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useTabsStore } from '../../stores/tabs';

const tabs = useTabsStore();
const { items, activeId } = storeToRefs(tabs);
const { setActive, close } = tabs;
</script>





