<template>
  <div class="flex-1 overflow-hidden flex flex-col">
    <div class="h-12 border-b border-slate-200 dark:border-slate-700 flex items-center gap-1 px-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
      <button :class="tabBtn('search')" @click="setTab('search')">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        {{ t('nav.search') }}
      </button>
      <button :class="tabBtn('plugins')" @click="setTab('plugins')">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
        </svg>
        Plugins
      </button>
      <button :class="tabBtn('settings')" @click="setTab('settings')">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
        {{ t('nav.settings') }}
      </button>
    </div>
    <div class="flex-1 overflow-auto">
      <SearchPanel v-if="rightTab==='search'" class="h-full" />
      <div v-else-if="rightTab==='plugins'" class="h-full overflow-auto p-6">
        <div class="text-center py-12">
          <div class="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
            </svg>
          </div>
          <div class="text-slate-500 dark:text-slate-400 mb-4">插件挂载点</div>
          <p class="text-sm text-slate-400 mb-4">启用的插件将在此处显示其界面组件</p>
          <button class="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors" @click="goToPluginSettings">
            管理插件 →
          </button>
        </div>
      </div>
      <SettingsAutoSave v-else class="p-6" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import SearchPanel from './SearchPanel.vue';
import SettingsAutoSave from './SettingsAutoSave.vue';
import { useLayoutStore } from '../../stores/layout';

const { t } = useI18n();
const layout = useLayoutStore();
const rightTab = computed(() => layout.rightTab);

function setTab(t: 'search'|'plugins'|'settings') { 
  layout.setRightTab(t); 
}

function goToPluginSettings() {
  layout.setNav('settings');
  // TODO: 设置插件管理为活动选项
}

function tabBtn(name: string) {
  const active = rightTab.value === name;
  return `flex items-center px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
    active 
      ? 'bg-blue-500 text-white shadow-sm' 
      : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
  }`;
}
</script>