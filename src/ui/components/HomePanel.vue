<template>
  <div class="h-full w-full overflow-auto p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
    <!-- Header -->
    <div class="max-w-6xl mx-auto">
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
          {{ t('home.title') }}
        </h1>
        <p class="text-slate-600 dark:text-slate-400 text-lg">{{ t('home.subtitle') }}</p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div class="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 hover:shadow-lg transition-all duration-300">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">{{ t('home.stats.files') }}</div>
              <div class="text-3xl font-bold text-blue-600 dark:text-blue-400">{{ files }}</div>
            </div>
            <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
          </div>
        </div>
        
        <div class="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 hover:shadow-lg transition-all duration-300">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">{{ t('home.stats.folders') }}</div>
              <div class="text-3xl font-bold text-purple-600 dark:text-purple-400">{{ dirs }}</div>
            </div>
            <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
              </svg>
            </div>
          </div>
        </div>
        
        <div class="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 hover:shadow-lg transition-all duration-300">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">{{ t('home.stats.workspace') }}</div>
              <div class="text-lg font-semibold text-slate-700 dark:text-slate-300 truncate" :title="workspacePath">
                {{ workspaceName }}
              </div>
            </div>
            <div class="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/50 dark:border-slate-700/50 mb-12">
        <h3 class="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-6 flex items-center">
          <div class="w-6 h-6 bg-gradient-to-br from-orange-400 to-pink-500 rounded-lg mr-3"></div>
          {{ t('home.quickActions.title') }}
        </h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button class="group p-6 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300" @click="createNote">
            <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
            </div>
            <div class="font-medium text-slate-700 dark:text-slate-300">{{ t('home.quickActions.newNote') }}</div>
          </button>
          
          <button class="group p-6 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-purple-400 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-300" @click="rebuildIndex">
            <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <svg class="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
            <div class="font-medium text-slate-700 dark:text-slate-300">{{ t('home.quickActions.rebuildIndex') }}</div>
          </button>
          
          <button class="group p-6 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-green-400 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-300" @click="openWorkspace">
            <div class="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
              </svg>
            </div>
            <div class="font-medium text-slate-700 dark:text-slate-300">{{ t('home.quickActions.openFolder') }}</div>
          </button>
          
          <button class="group p-6 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-amber-400 dark:hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all duration-300" @click="reload">
            <div class="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <svg class="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
            </div>
            <div class="font-medium text-slate-700 dark:text-slate-300">{{ t('home.quickActions.refresh') }}</div>
          </button>
        </div>
      </div>

      <!-- Recent Files -->
      <div class="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/50 dark:border-slate-700/50">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-semibold text-slate-800 dark:text-slate-200 flex items-center">
            <div class="w-6 h-6 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-lg mr-3"></div>
            {{ t('home.recent.title') }}
          </h3>
          <button class="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors" @click="reload">
            {{ t('home.recent.refresh') }}
          </button>
        </div>
        
        <div v-if="!recent || recent.length === 0" class="text-center py-16">
          <div class="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </div>
          <div class="text-slate-500 dark:text-slate-400">{{ t('home.recent.empty') }}</div>
        </div>
        
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="r in (recent || []).slice(0, 9)" :key="r.file" 
               class="group p-4 rounded-xl hover:bg-white dark:hover:bg-slate-700/50 cursor-pointer transition-all duration-300 border border-transparent hover:border-slate-200 dark:hover:border-slate-600 hover:shadow-md" 
               @dblclick="open(r.file)">
            <div class="flex items-start space-x-3">
              <div class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" :class="getFileIconBg(r.file)">
                <svg class="w-5 h-5" :class="getFileIconColor(r.file)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getFileIconPath(r.file)"/>
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <div class="font-medium text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {{ basename(r.file) }}
                </div>
                <div class="text-sm text-slate-500 dark:text-slate-400 truncate">
                  {{ relativePath(r.file) }}
                </div>
                <div class="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  {{ formatTime(r.mtime) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { useHomeStore } from '../../stores/home';
import { useSettingsStore } from '../../stores/settings';
import { useTabGroupsStore } from '../../stores/tabgroups';
import { useSearchStore } from '../../stores/search';

const { t } = useI18n();
const home = useHomeStore();
const settings = useSettingsStore();
const tabs = useTabGroupsStore();
const search = useSearchStore();
const { files, dirs, recent } = storeToRefs(home);
const workspacePath = computed(() => settings.data?.workspacePath || '');
const workspaceName = computed(() => {
  const parts = workspacePath.value.split(/[/\\]/);
  return parts[parts.length - 1] || workspacePath.value;
});

function basename(p: string) {
  const parts = p.split(/[/\\]/);
  return parts[parts.length - 1];
}

function relativePath(p: string) {
  const ws = workspacePath.value;
  return p.startsWith(ws) ? p.slice(ws.length + 1) : p;
}

function getFileIconBg(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'md': return 'bg-blue-100 dark:bg-blue-900/30';
    case 'txt': return 'bg-slate-100 dark:bg-slate-700';
    case 'json': return 'bg-yellow-100 dark:bg-yellow-900/30';
    case 'png': case 'jpg': case 'jpeg': return 'bg-green-100 dark:bg-green-900/30';
    default: return 'bg-slate-100 dark:bg-slate-700';
  }
}

function getFileIconColor(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'md': return 'text-blue-600 dark:text-blue-400';
    case 'txt': return 'text-slate-600 dark:text-slate-400';
    case 'json': return 'text-yellow-600 dark:text-yellow-400';
    case 'png': case 'jpg': case 'jpeg': return 'text-green-600 dark:text-green-400';
    default: return 'text-slate-600 dark:text-slate-400';
  }
}

function getFileIconPath(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'md': return 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z';
    case 'json': return 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z';
    case 'png': case 'jpg': case 'jpeg': return 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z';
    default: return 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z';
  }
}

function formatTime(mtime: number) {
  const date = new Date(mtime);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  
  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${Math.floor(diffHours)}h ago`;
  if (diffDays < 7) return `${Math.floor(diffDays)}d ago`;
  return date.toLocaleDateString();
}

async function reload() { 
  await home.load(); 
}

async function open(file: string) {
  const content = await window.mn.ipc.invoke('file:read', file);
  tabs.open({ title: basename(file), path: file, content });
}

async function createNote() {
  let name = prompt('Note name (e.g., my-note.md):') || 'untitled.md';
  if (!name.includes('.')) name += '.md';
  const fullPath = `${workspacePath.value}/${name}`;
  await window.mn.ipc.invoke('file:create', fullPath, false);
  await reload();
  await open(fullPath);
}

async function rebuildIndex() {
  const result = await search.rebuildIndex();
  alert(`Index rebuilt: ${result.files} files, ${result.chunks} chunks`);
}

async function openWorkspace() {
  await window.mn.ipc.invoke('system:openPath', workspacePath.value);
}

home.load();
</script>