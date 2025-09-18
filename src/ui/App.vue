<template>
  <div class="w-screen h-screen flex flex-col select-none bg-slate-50 dark:bg-slate-900">
    <!-- Title Bar -->
    <div class="drag titlebar h-12 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
      <div class="flex items-center gap-3 no-drag">
        <div class="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <div class="w-3 h-3 bg-white rounded-sm"></div>
        </div>
        <button class="px-3 py-1.5 text-sm rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" @click="toggleLeft">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>
        <button class="px-3 py-1.5 text-sm rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" @click="openSearch">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </button>
      </div>
      <div class="flex items-center gap-2 no-drag">
        <div class="w-7 h-7 bg-slate-200 dark:bg-slate-600 rounded-full"></div>
        <button class="px-3 py-1.5 text-sm rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" @click="toggleRight">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
          </svg>
        </button>
        <button class="w-8 h-8 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center justify-center" @click="minimize">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/>
          </svg>
        </button>
        <button class="w-8 h-8 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center justify-center" @click="maximize">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4a2 2 0 012-2h2M4 16v4a2 2 0 002 2h2m8-16h2a2 2 0 012 2v2m-4 12h2a2 2 0 002-2v-2"/>
          </svg>
        </button>
        <button class="w-8 h-8 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors flex items-center justify-center text-red-600" @click="closeWin">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Workbench -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Side Nav -->
      <div class="w-16 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div class="flex flex-col items-center py-4 gap-3">
          <button :class="navBtn('home')" @click="openHomeTab($event)" :title="t('nav.home')">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </svg>
          </button>
          <button :class="navBtn('subscriptions')" @click="openSubscriptionsTab($event)" :title="t('nav.subscriptions')">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zM4 19h10a1 1 0 001-1v-8a1 1 0 00-1-1H4a1 1 0 00-1 1v8a1 1 0 001 1z"/>
            </svg>
          </button>
          <button :class="navBtn('search')" @click="openSearch" :title="t('nav.search')">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </button>
          <button :class="navBtn('journal')" @click="openJournalTab($event)" :title="t('nav.journal')">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
            </svg>
          </button>
          <button :class="navBtn('review')" @click="openReviewTab($event)" title="复习">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-3.866 0-7 2.239-7 5 0 1.657 1.343 3 3 3h8a3 3 0 003-3c0-2.761-3.134-5-7-5zm0 0V4m0 12v4"/>
            </svg>
          </button>
          <div class="flex-1"></div>
          <button :class="navBtn('settings')" @click="openSettingsTab($event)" :title="t('nav.settings')">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Left Panel (resizable) -->
      <div
        class="h-full border-r border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col bg-white dark:bg-slate-800"
        :style="{ width: leftOpen ? leftWidth + 'px' : '0px', transition: isResizingLeft ? 'none' : 'width 200ms ease' }"
      >
        <Explorer v-show="leftOpen" class="flex-1" />
      </div>
      <!-- Left Resizer -->
      <div
        v-show="leftOpen"
        class="no-drag w-2 cursor-col-resize hover:bg-slate-200/70 dark:hover:bg-slate-700/70 transition-colors"
        :class="{ 'bg-slate-300/70 dark:bg-slate-600/70': isResizingLeft }"
        @mousedown="onLeftResize"
        @dblclick="resetLeftWidth"
      />

      <!-- Content Area: Editor Groups only; nav opens tabs -->
      <div class="flex-1 flex min-w-0 min-h-0">
        <div class="flex-1 min-w-0 min-h-0">
          <EditorGroup :node="tabgroups.root" />
        </div>
      </div>

      <!-- Right Resizer -->
      <div
        v-show="rightOpen"
        class="no-drag w-2 cursor-col-resize hover:bg-slate-200/70 dark:hover:bg-slate-700/70 transition-colors"
        :class="{ 'bg-slate-300/70 dark:bg-slate-600/70': isResizingRight }"
        @mousedown="onRightResize"
        @dblclick="resetRightWidth"
      />

      <!-- Right Panel (resizable) -->
      <div
        class="h-full border-l border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col bg-white dark:bg-slate-800"
        :style="{ width: rightOpen ? rightWidth + 'px' : '0px', transition: isResizingRight ? 'none' : 'width 200ms ease' }"
      >
        <RightPanel v-show="rightOpen" />
      </div>
    </div>

    <!-- Status Bar -->
    <StatusBar />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSettingsStore } from '../stores/settings';
import Explorer from './components/Explorer.vue';
import EditorGroup from './components/EditorGroup.vue';
import { useTabGroupsStore } from '../stores/tabgroups';
import StatusBar from './components/StatusBar.vue';
import RightPanel from './components/RightPanel.vue';
import { useLayoutStore } from '../stores/layout';
import HomePanel from './components/HomePanel.vue';
import SubscriptionsPanel from './components/SubscriptionsPanel.vue';
import JournalPanel from './components/JournalPanel.vue';
import SettingsPanel from './components/SettingsPanel.vue';
import { storeToRefs } from 'pinia';

const leftOpen = ref(true);
const rightOpen = ref(true);
const leftWidth = ref(288); // 18rem
const rightWidth = ref(320); // 20rem
const minSidebar = 200;
const maxSidebar = 600;
const isResizingLeft = ref(false);
const isResizingRight = ref(false);
const { t } = useI18n();
const settings = useSettingsStore();
settings.load();

const tabgroups = useTabGroupsStore();
const layout = useLayoutStore();
const activeNav = computed(() => layout.activeNav);
const activeTabView = computed(() => {
  return (tabgroups.activeTab as any)?.view || null;
});

function setNav(n: 'home'|'subscriptions'|'search'|'journal'|'review'|'settings') { 
  layout.setNav(n); 
}

function openSearch() { 
  layout.setRightTab('search'); 
  rightOpen.value = true; 
}

function toggleLeft() {
  leftOpen.value = !leftOpen.value;
}

function toggleRight() {
  rightOpen.value = !rightOpen.value;
}

function onLeftResize(e: MouseEvent) {
  const startX = e.clientX;
  const startWidth = leftWidth.value;
  isResizingLeft.value = true;
  document.body.classList.add('cursor-col-resize');
  document.body.style.userSelect = 'none';
  function onMove(ev: MouseEvent) {
    const dx = ev.clientX - startX;
    let next = startWidth + dx;
    if (next < minSidebar) next = minSidebar;
    if (next > maxSidebar) next = maxSidebar;
    leftWidth.value = next;
  }
  function onUp() {
    window.removeEventListener('mousemove', onMove);
    window.removeEventListener('mouseup', onUp);
    isResizingLeft.value = false;
    document.body.classList.remove('cursor-col-resize');
    document.body.style.userSelect = '';
  }
  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onUp);
}

function onRightResize(e: MouseEvent) {
  const startX = e.clientX;
  const startWidth = rightWidth.value;
  isResizingRight.value = true;
  document.body.classList.add('cursor-col-resize');
  document.body.style.userSelect = 'none';
  function onMove(ev: MouseEvent) {
    const dx = startX - ev.clientX;
    let next = startWidth + dx;
    if (next < minSidebar) next = minSidebar;
    if (next > maxSidebar) next = maxSidebar;
    rightWidth.value = next;
  }
  function onUp() {
    window.removeEventListener('mousemove', onMove);
    window.removeEventListener('mouseup', onUp);
    isResizingRight.value = false;
    document.body.classList.remove('cursor-col-resize');
    document.body.style.userSelect = '';
  }
  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onUp);
}

function resetLeftWidth() {
  leftWidth.value = 288;
}
function resetRightWidth() {
  rightWidth.value = 320;
}

function navBtn(n: string) {
  const active = activeTabView.value === n;
  return `w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 ${
    active 
      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25' 
      : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'
  }`;
}

function openHomeTab(e?: MouseEvent) {
  layout.setNav('home');
  if (e?.shiftKey) tabgroups.openInLeaf(tabgroups.getNextLeafId(), { title: t('nav.home'), view: 'home' });
  else tabgroups.open({ title: t('nav.home'), view: 'home' });
}
function openSubscriptionsTab(e?: MouseEvent) {
  layout.setNav('subscriptions');
  if (e?.shiftKey) tabgroups.openInLeaf(tabgroups.getNextLeafId(), { title: t('nav.subscriptions'), view: 'subscriptions' });
  else tabgroups.open({ title: t('nav.subscriptions'), view: 'subscriptions' });
}
function openJournalTab(e?: MouseEvent) {
  layout.setNav('journal');
  if (e?.shiftKey) tabgroups.openInLeaf(tabgroups.getNextLeafId(), { title: t('nav.journal'), view: 'journal' });
  else tabgroups.open({ title: t('nav.journal'), view: 'journal' });
}
function openReviewTab(e?: MouseEvent) {
  layout.setNav('review');
  const title = '复习';
  if (e?.shiftKey) tabgroups.openInLeaf(tabgroups.getNextLeafId(), { title, view: 'review' });
  else tabgroups.open({ title, view: 'review' });
}
function openSettingsTab(e?: MouseEvent) {
  layout.setNav('settings');
  if (e?.shiftKey) tabgroups.openInLeaf(tabgroups.getNextLeafId(), { title: t('nav.settings'), view: 'settings' });
  else tabgroups.open({ title: t('nav.settings'), view: 'settings' });
}

async function minimize() {
  await window.mn.ipc.invoke('window:minimize');
}
async function maximize() {
  await window.mn.ipc.invoke('window:maximizeOrRestore');
}
async function closeWin() {
  await window.mn.ipc.invoke('window:close');
}
</script>

<style scoped>
.titlebar {
  -webkit-app-region: drag;
}
.no-drag {
  -webkit-app-region: no-drag;
}
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.3s ease;
}
.slide-left-enter-from,
.slide-left-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s ease;
}
.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>