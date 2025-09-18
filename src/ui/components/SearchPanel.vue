<template>
  <div class="h-full flex flex-col p-6">
    <!-- Search Input -->
    <div class="mb-6">
      <div class="relative">
        <input 
          v-model="query" 
          @keyup.enter="searchAction" 
          type="text" 
          placeholder="搜索知识库..."
          class="w-full px-4 py-3 pl-12 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        <svg class="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
      </div>
      <div class="flex gap-2 mt-3">
        <button 
          @click="searchAction" 
          class="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          搜索
        </button>
        <button 
          @click="askQuestion" 
          class="flex-1 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          问答
        </button>
      </div>
    </div>

    <!-- Results -->
    <div class="flex-1 overflow-auto">
      <!-- Search Results -->
      <div v-if="searchResults && searchResults.length > 0" class="mb-6">
        <h3 class="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center">
          <svg class="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          搜索结果 ({{ searchResults.length }})
        </h3>
        <div class="space-y-3">
          <div 
            v-for="r in searchResults" 
            :key="r.id" 
            class="p-4 bg-white dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 hover:shadow-md transition-all cursor-pointer"
            @click="openResult(r)"
          >
            <div class="flex items-center justify-between mb-2">
              <div class="font-medium text-slate-800 dark:text-slate-200 text-sm">
                {{ basename(r.file) }}
              </div>
              <div class="text-xs text-blue-600 dark:text-blue-400 font-medium">
                {{ (r.score * 100).toFixed(1) }}%
              </div>
            </div>
            <div class="text-xs text-slate-500 dark:text-slate-400 mb-2">
              {{ relativePath(r.file) }}
            </div>
            <div class="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">
              {{ r.text }}
            </div>
          </div>
        </div>
      </div>

      <!-- LLM Response -->
      <div v-if="llmResponse" class="mb-6">
        <h3 class="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center">
          <svg class="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          AI 回答
        </h3>
        <div class="p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
          <div class="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{{ llmResponse }}</div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="(!searchResults || !searchResults.length) && !llmResponse" class="text-center py-12">
        <div class="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </div>
        <div class="text-slate-500 dark:text-slate-400 text-sm">
          在这里搜索您的知识库或询问问题
        </div>
      </div>
    </div>

    <!-- Index Management -->
    <div class="border-t border-slate-200 dark:border-slate-700 pt-4 mt-4">
      <button 
        @click="rebuildIndex" 
        class="w-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
        </svg>
        重建搜索索引
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useSearchStore } from '../../stores/search';
import { useTabGroupsStore } from '../../stores/tabgroups';
import { useSettingsStore } from '../../stores/settings';

const search = useSearchStore();
const tabs = useTabGroupsStore();
const settings = useSettingsStore();
const { semantic: searchResults, answer: llmResponse } = storeToRefs(search);
const query = ref('');

const workspacePath = computed(() => settings.data?.workspacePath || '');

function basename(p: string) {
  const parts = p.split(/[/\\]/);
  return parts[parts.length - 1];
}

function relativePath(p: string) {
  const ws = workspacePath.value;
  return p.startsWith(ws) ? p.slice(ws.length + 1) : p;
}

async function searchAction() {
  if (!query.value.trim()) return;
  await search.runSemantic(query.value);
}

async function askQuestion() {
  if (!query.value.trim()) return;
  await search.ask(query.value);
}

async function rebuildIndex() {
  const result = await search.rebuildIndex();
  alert(`索引重建完成: ${result.files} 文件, ${result.chunks} 片段`);
}

async function openResult(result: any) {
  const content = await window.mn.ipc.invoke('file:read', result.file);
  tabs.open({ 
    title: basename(result.file), 
    path: result.file, 
    content 
  });
}

</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>