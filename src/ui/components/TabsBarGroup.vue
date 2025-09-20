<template>
<div class="h-10 border-b border-surface-200/60 dark:border-surface-700/60 flex items-center relative bg-gradient-to-r from-white/80 to-surface-50/80 dark:from-surface-900/80 dark:to-surface-800/80 backdrop-blur-sm"
     @click.self="menuOpen=false; moreOpen=false"
     @dragover.prevent="onContainerDragOver"
     @drop="onContainerDrop">
    
    <!-- 标签容器 -->
    <div class="flex-1 min-w-0 relative">
      <!-- 自定义滚动条 -->
      <div v-if="showScrollbar" class="absolute bottom-0 left-3 right-3 h-0.5 bg-surface-200 dark:bg-surface-700 rounded-full z-20 pointer-events-none">
        <div 
          class="h-full bg-primary-400 dark:bg-primary-500 rounded-full transition-all duration-200 cursor-pointer hover:bg-primary-500 dark:hover:bg-primary-400 pointer-events-auto"
          :style="{ width: scrollbarWidth + '%', left: scrollbarLeft + '%' }"
          @mousedown="onScrollbarDrag"
        />
      </div>
      
      <div ref="tabsContainer" 
           class="flex items-center gap-0.5 px-3 overflow-x-auto overflow-y-hidden scrollbar-hide relative z-10 min-w-0"
           style="scroll-behavior: smooth;"
           @scroll="updateScrollbar">
        <div v-for="(tab, idx) in leaf.items" :key="tab.id"
         :data-tab-id="tab.id"
         class="group relative px-3 h-8 flex items-center rounded-lg cursor-pointer transition-all duration-200 ease-out hover:bg-surface-100/70 dark:hover:bg-surface-700/70 hover:shadow-sm hover:scale-[1.02] flex-shrink-0"
         :class="{ 
           'bg-gradient-to-r from-primary-50 to-primary-100/50 dark:from-primary-900/30 dark:to-primary-800/30 text-primary-700 dark:text-primary-300 shadow-sm border border-primary-200/50 dark:border-primary-700/50 scale-[1.02]': tab.id === leaf.activeId,
           'text-surface-600 dark:text-surface-400 hover:text-surface-800 dark:hover:text-surface-200': tab.id !== leaf.activeId
         }"
         @click="setActive(leafId, tab.id)"
         draggable="true"
         @dragstart="onDragStart($event, idx)"
         @dragover.prevent
         @drop="onDrop($event, idx)"
         @contextmenu.prevent.stop="openMenu($event, tab.id)">
      
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
      <button class="ml-2 w-5 h-5 rounded-md flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 hover:bg-surface-200/80 dark:hover:bg-surface-600/80 transition-all duration-200 hover:scale-110" 
              @click.stop="close(leafId, tab.id)"
              :class="tab.id === leaf.activeId ? 'text-primary-600 dark:text-primary-400' : 'text-surface-500 dark:text-surface-400'"
              title="关闭标签">
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
      
          <!-- 活动标签指示器 -->
          <div v-if="tab.id === leaf.activeId" class="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full" />
        </div>
      </div>
    </div>
    
    <!-- 工具栏按钮区域 -->
    <div class="flex items-center gap-1 pl-3 ml-3 border-l border-surface-200/50 dark:border-surface-700/50 relative z-20 shrink-0">
      <button class="p-1.5 text-xs hover:bg-surface-100 dark:hover:bg-surface-700 rounded-md transition-all duration-200 hover:scale-105 text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200" 
              @click="splitRight" 
              title="分屏到右侧">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
        </svg>
      </button>
      <button class="p-1.5 text-xs hover:bg-surface-100 dark:hover:bg-surface-700 rounded-md transition-all duration-200 hover:scale-105 text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200" 
              @click="splitDown" 
              title="分屏到下方">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
        </svg>
      </button>
      <button class="px-2 py-1.5 text-sm hover:bg-surface-100 dark:hover:bg-surface-700 rounded-md transition-all duration-200 hover:scale-105 text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200" 
              @click="openMore($event)" 
              title="更多选项">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
        </svg>
      </button>
    </div>
    <!-- click-away overlay and context menu via teleport to avoid clipping -->
    <teleport to="body">
      <div v-if="menuOpen" class="fixed inset-0 z-[50]" @click="menuOpen=false"></div>
      <!-- context menu (fixed to avoid clipping by overflow) -->
      <div v-if="menuOpen" class="menu-popup fixed z-[60] bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10 text-sm min-w-[200px] py-2 transition-all duration-200" :style="{ left: menuX+'px', top: menuY+'px' }">
        <div class="px-4 py-2.5 hover:bg-surface-100/80 dark:hover:bg-surface-700/80 cursor-pointer transition-colors duration-150 flex items-center gap-2" @click="close(leafId, menuTabId); menuOpen=false">
          <svg class="w-4 h-4 text-surface-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
          关闭标签
        </div>
        <div class="px-4 py-2.5 hover:bg-surface-100/80 dark:hover:bg-surface-700/80 cursor-pointer transition-colors duration-150 flex items-center gap-2" @click="closeOthers(leafId, menuTabId); menuOpen=false">
          <svg class="w-4 h-4 text-surface-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
          关闭其他标签
        </div>
        <div class="mx-2 my-1 border-t border-surface-200 dark:border-surface-700"></div>
        <div class="px-4 py-2.5 hover:bg-surface-100/80 dark:hover:bg-surface-700/80 cursor-pointer transition-colors duration-150 flex items-center gap-2" @click="splitTabTo(menuTabId, 'row'); menuOpen=false">
          <svg class="w-4 h-4 text-surface-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
          在右侧打开
        </div>
        <div class="px-4 py-2.5 hover:bg-surface-100/80 dark:hover:bg-surface-700/80 cursor-pointer transition-colors duration-150 flex items-center gap-2" @click="splitTabTo(menuTabId, 'col'); menuOpen=false">
          <svg class="w-4 h-4 text-surface-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
          </svg>
          在下方打开
        </div>
      </div>
    </teleport>
    <!-- more menu overlay via teleport -->
    <teleport to="body">
      <div v-if="moreOpen" class="fixed inset-0 z-[50]" @click="moreOpen=false"></div>
      <div v-if="moreOpen" class="menu-popup fixed z-[60] bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10 text-sm min-w-[240px] py-2 transition-all duration-200" :style="{ left: moreX+'px', top: moreY+'px' }">
        <div class="px-4 py-2.5 hover:bg-surface-100/80 dark:hover:bg-surface-700/80 cursor-pointer transition-colors duration-150 flex items-center gap-2" @click="onCloseAll(false)">
          <svg class="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
          关闭全部标签
        </div>
        <div class="px-4 py-2.5 hover:bg-surface-100/80 dark:hover:bg-surface-700/80 cursor-pointer transition-colors duration-150 flex items-center gap-2" @click="onCloseAll(true)">
          <svg class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          保存并关闭全部
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue';
import { useTabGroupsStore } from '../../stores/tabgroups';

const props = defineProps<{ leafId: string }>();
const store = useTabGroupsStore();
const leaf = computed(() => store.findLeaf(props.leafId) || { id: props.leafId, items: [], activeId: '' } as any);

const { setActive, close, closeOthers, moveTab, duplicateTabTo, splitLeafTo } = store as any;
import { useEditorStore } from '../../stores/editor';
const editor = useEditorStore();
const menuOpen = ref(false);
const moreOpen = ref(false);
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
const moreX = ref(0);
const moreY = ref(0);

// 滚动相关状态
const tabsContainer = ref<HTMLDivElement | null>(null);
const scrollPosition = ref(0);
const maxScrollPosition = ref(0);
const showScrollbar = ref(false);
const scrollbarWidth = ref(100);
const scrollbarLeft = ref(0);

// 检查是否需要显示滚动条
function updateScrollState() {
  if (!tabsContainer.value) return;
  const container = tabsContainer.value;
  const canScroll = container.scrollWidth > container.clientWidth;
  showScrollbar.value = canScroll;
  maxScrollPosition.value = Math.max(0, container.scrollWidth - container.clientWidth);
  scrollPosition.value = container.scrollLeft;
  updateScrollbar();
}

// 更新滚动条位置和大小
function updateScrollbar() {
  if (!tabsContainer.value || !showScrollbar.value) return;
  const container = tabsContainer.value;
  const scrollRatio = container.clientWidth / container.scrollWidth;
  const scrollLeftRatio = container.scrollLeft / maxScrollPosition.value;
  
  scrollbarWidth.value = Math.max(10, scrollRatio * 100); // 最小10%宽度
  scrollbarLeft.value = scrollLeftRatio * (100 - scrollbarWidth.value);
}

// 拖动滚动条
function onScrollbarDrag(e: MouseEvent) {
  if (!tabsContainer.value) return;
  
  e.preventDefault();
  const startX = e.clientX;
  const startScrollLeft = tabsContainer.value.scrollLeft;
  const scrollbarTrack = tabsContainer.value.clientWidth - 24; // 减去padding
  
  function onMouseMove(moveEvent: MouseEvent) {
    if (!tabsContainer.value) return;
    const deltaX = moveEvent.clientX - startX;
    const scrollDelta = (deltaX / scrollbarTrack) * maxScrollPosition.value;
    const newScrollLeft = Math.max(0, Math.min(maxScrollPosition.value, startScrollLeft + scrollDelta));
    tabsContainer.value.scrollLeft = newScrollLeft;
  }
  
  function onMouseUp() {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  }
  
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
}

// 滚动到活动标签
function scrollToActiveTab() {
  if (!tabsContainer.value || !leaf.value.activeId) return;
  
  nextTick(() => {
    const activeTabElement = tabsContainer.value?.querySelector(`[data-tab-id="${leaf.value.activeId}"]`) as HTMLElement;
    if (activeTabElement) {
      const containerRect = tabsContainer.value!.getBoundingClientRect();
      const tabRect = activeTabElement.getBoundingClientRect();
      
      if (tabRect.left < containerRect.left || tabRect.right > containerRect.right) {
        activeTabElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  });
}

// 监听容器滚动事件
function onScroll() {
  updateScrollbar();
}

// 监听窗口大小变化
function onResize() {
  updateScrollState();
  scrollToActiveTab();
}

onMounted(() => {
  updateScrollState();
  scrollToActiveTab();
  
  if (tabsContainer.value) {
    tabsContainer.value.addEventListener('scroll', onScroll);
    // map vertical wheel to horizontal scrolling within the tabs bar
    tabsContainer.value.addEventListener('wheel', onWheel, { passive: false });
  }
  
  window.addEventListener('resize', onResize);
});

onBeforeUnmount(() => {
  if (tabsContainer.value) {
    tabsContainer.value.removeEventListener('scroll', onScroll);
    tabsContainer.value.removeEventListener('wheel', onWheel as any);
  }
  window.removeEventListener('resize', onResize);
});

// 监听标签变化
watch(() => leaf.value.items.length, () => {
  nextTick(() => {
    updateScrollState();
    scrollToActiveTab();
  });
});

// 监听活动标签变化
watch(() => leaf.value.activeId, () => {
  scrollToActiveTab();
});

function splitRight() {
  splitActiveTo('row');
}
function splitDown() {
  splitActiveTo('col');
}

function openMore(e: MouseEvent) {
  moreOpen.value = true;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const padding = 16;
  const mx = (e as MouseEvent).clientX;
  const my = (e as MouseEvent).clientY;
  const estW = 240;
  const estH = 120;
  
  // 确保菜单在视口内，优先向左上方展开
  let x = mx;
  let y = my + 8; // 在按钮下方一点点
  
  // 如果右侧空间不足，向左展开
  if (x + estW > vw - padding) {
    x = mx - estW;
  }
  
  // 如果下方空间不足，向上展开
  if (y + estH > vh - padding) {
    y = my - estH - 8;
  }
  
  // 确保不会超出视口边界
  moreX.value = Math.max(padding, Math.min(x, vw - estW - padding));
  moreY.value = Math.max(padding, Math.min(y, vh - estH - padding));
}

function onCloseAll(saveBefore: boolean) {
  if (saveBefore) {
    // 先保存当前叶的所有可保存文件
    for (const t of leaf.value.items) {
      if ((t as any).path && (t as any).dirty) {
        // 临时将该标签设为激活以复用现有保存逻辑
        setActive(leaf.value.id, t.id);
        editor.saveActive();
      }
    }
  }
  // 关闭全部
  const ids = leaf.value.items.map(t => t.id);
  for (const id of ids) close(leaf.value.id, id);
  moreOpen.value = false;
}

function openMenu(e: MouseEvent, id: string) {
  menuOpen.value = true;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const padding = 16;
  const mx = (e as MouseEvent).clientX;
  const my = (e as MouseEvent).clientY;
  const estW = 200;
  const estH = 160;
  
  // 确保菜单在视口内，优先向右下方展开
  let x = mx + 8;
  let y = my + 8;
  
  // 如果右侧空间不足，向左展开
  if (x + estW > vw - padding) {
    x = mx - estW - 8;
  }
  
  // 如果下方空间不足，向上展开
  if (y + estH > vh - padding) {
    y = my - estH - 8;
  }
  
  // 确保不会超出视口边界
  menuX.value = Math.max(padding, Math.min(x, vw - estW - padding));
  menuY.value = Math.max(padding, Math.min(y, vh - estH - padding));
  menuTabId.value = id;
}

// 将鼠标滚轮的垂直滚动转为水平滚动
function onWheel(e: WheelEvent) {
  if (!tabsContainer.value) return;
  const container = tabsContainer.value;
  // 使用更显著的轴作为滚动来源
  const dominant = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
  if (dominant) {
    e.preventDefault();
    const next = Math.max(0, Math.min(maxScrollPosition.value, container.scrollLeft + dominant));
    container.scrollLeft = next;
    updateScrollbar();
  }
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

/* 禁用状态的按钮样式 */
button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

button:disabled:hover {
  background-color: transparent !important;
  transform: none !important;
}

/* 确保菜单始终在最顶层 */
.menu-popup {
  z-index: 60 !important;
  position: fixed !important;
}

/* 菜单项悬停效果 */
.menu-item:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.dark .menu-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}
</style>
