<template>
  <div class="h-10 border-b border-surface-200/60 dark:border-surface-700/60 flex items-center bg-gradient-to-r from-white/80 to-surface-50/80 dark:from-surface-900/80 dark:to-surface-800/80 backdrop-blur-sm">
    <!-- 标签容器 -->
    <div ref="tabsContainer" class="flex-1 flex items-center gap-0.5 px-3 overflow-x-auto overflow-y-hidden scrollbar-hide" style="scroll-behavior: smooth;">
      <div 
        v-for="tab in items" 
        :key="tab.id"
        :data-tab-id="tab.id"
        class="group relative px-3 h-8 flex items-center rounded-lg cursor-pointer transition-all duration-200 ease-out hover:bg-surface-100/70 dark:hover:bg-surface-700/70 hover:shadow-sm hover:scale-[1.02] flex-shrink-0" 
        :class="{ 
          'bg-gradient-to-r from-primary-50 to-primary-100/50 dark:from-primary-900/30 dark:to-primary-800/30 text-primary-700 dark:text-primary-300 shadow-sm border border-primary-200/50 dark:border-primary-700/50 scale-[1.02]': tab.id === activeId,
          'text-surface-600 dark:text-surface-400 hover:text-surface-800 dark:hover:text-surface-200': tab.id !== activeId
        }" 
        @click="setActive(tab.id)"
      >
      <!-- 文件类型图标 -->
      <div class="mr-2 w-4 h-4 flex items-center justify-center">
        <svg v-if="getFileIcon(tab)" class="w-3.5 h-3.5 opacity-70 transition-opacity group-hover:opacity-100" :class="getFileIconColor(tab)" fill="currentColor" viewBox="0 0 20 20">
          <path :d="getFileIcon(tab)" />
        </svg>
        <div v-else class="w-2 h-2 rounded-full bg-current opacity-40 transition-all group-hover:opacity-60 group-hover:scale-110" />
      </div>
      
      <span class="truncate max-w-[180px] text-sm font-medium transition-all">{{ tab.title }}</span>
      
      <!-- 修改状态指示器 -->
      <div v-if="tab.dirty" class="ml-2 w-2 h-2 rounded-full bg-amber-400 dark:bg-amber-500 animate-pulse shadow-sm" title="未保存的更改" />
      
      <!-- 关闭按钮 -->
      <button 
        class="ml-2 w-5 h-5 rounded-md flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 hover:bg-surface-200/80 dark:hover:bg-surface-600/80 transition-all duration-200 hover:scale-110" 
        @click.stop="close(tab.id)"
        :class="tab.id === activeId ? 'text-primary-600 dark:text-primary-400' : 'text-surface-500 dark:text-surface-400'"
        title="关闭标签"
      >
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
      
        <!-- 活动标签指示器 -->
        <div v-if="tab.id === activeId" class="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full" />
      </div>
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

// 获取文件类型图标
function getFileIcon(tab: any): string | null {
  const title = tab.title?.toLowerCase() || '';
  const path = tab.path?.toLowerCase() || '';
  
  // 根据文件扩展名返回对应的SVG路径
  if (path.endsWith('.md') || title.includes('markdown')) {
    return 'M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z'; // 文档图标
  }
  if (path.endsWith('.txt') || title.includes('text')) {
    return 'M9 2a1 1 0 000 2h2a1 1 0 100-2H9z M4 5a2 2 0 012-2v1a1 1 0 001 1h6a1 1 0 001-1V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5z'; // 文本图标
  }
  if (path.endsWith('.json') || title.includes('json')) {
    return 'M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z'; // 数据图标
  }
  if (tab.view === 'home') {
    return 'M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z'; // 主页图标
  }
  if (tab.view === 'settings') {
    return 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100-4m0 4v2m0-6V4'; // 设置图标
  }
  if (tab.view === 'search') {
    return 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'; // 搜索图标
  }
  if (tab.view === 'journal') {
    return 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'; // 日记图标
  }
  if (tab.view === 'review') {
    return 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z'; // 复习图标
  }
  
  return null;
}

// 获取文件图标颜色
function getFileIconColor(tab: any): string {
  const title = tab.title?.toLowerCase() || '';
  const path = tab.path?.toLowerCase() || '';
  
  if (path.endsWith('.md') || title.includes('markdown')) {
    return 'text-blue-500 dark:text-blue-400';
  }
  if (path.endsWith('.txt') || title.includes('text')) {
    return 'text-gray-500 dark:text-gray-400';
  }
  if (path.endsWith('.json') || title.includes('json')) {
    return 'text-yellow-500 dark:text-yellow-400';
  }
  if (tab.view === 'home') {
    return 'text-emerald-500 dark:text-emerald-400';
  }
  if (tab.view === 'settings') {
    return 'text-slate-500 dark:text-slate-400';
  }
  if (tab.view === 'search') {
    return 'text-indigo-500 dark:text-indigo-400';
  }
  if (tab.view === 'journal') {
    return 'text-purple-500 dark:text-purple-400';
  }
  if (tab.view === 'review') {
    return 'text-rose-500 dark:text-rose-400';
  }
  
  return 'text-surface-500 dark:text-surface-400';
}
</script>

<style scoped>
.scrollbar-hide {
  /* 隐藏滚动条但保持滚动功能 */
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;  /* Chrome, Safari and Opera */
}
</style>

