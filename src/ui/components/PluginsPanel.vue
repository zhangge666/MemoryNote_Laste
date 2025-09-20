<template>
  <div class="h-full overflow-auto p-6">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-lg font-semibold text-surface-800 dark:text-surface-200 flex items-center">
        <div class="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg mr-3"></div>
        插件管理器
      </h3>
      <button class="text-sm text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200 transition-colors">
        安装新插件
      </button>
    </div>

    <div v-if="!plugins || plugins.length === 0" class="text-center py-12">
      <div class="w-16 h-16 bg-surface-100 dark:bg-surface-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
        </svg>
      </div>
      <div class="text-surface-500 dark:text-surface-400 mb-4">暂无已安装的插件</div>
      <button class="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium transition-colors">
        浏览插件市场 →
      </button>
    </div>

    <div v-else class="space-y-4">
      <div 
        v-for="plugin in plugins" 
        :key="plugin.id" 
        class="bg-white dark:bg-surface-700 rounded-xl border border-surface-200 dark:border-surface-600 p-4 hover:shadow-md transition-all"
      >
        <div class="flex items-start justify-between">
          <div class="flex items-start space-x-3">
            <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <div class="w-5 h-5 bg-white rounded-sm"></div>
            </div>
            <div class="flex-1">
              <div class="font-medium text-surface-800 dark:text-surface-200">{{ plugin.name }}</div>
              <div class="text-sm text-surface-500 dark:text-surface-400 mb-2">{{ plugin.description }}</div>
              <div class="flex items-center space-x-3 text-xs text-surface-400">
                <span>v{{ plugin.version }}</span>
                <span>•</span>
                <span>{{ plugin.author }}</span>
              </div>
            </div>
          </div>
          <ToggleSwitch
            :model-value="plugin.enabled"
            @update:model-value="toggle(plugin.id)"
            :aria-label="`切换 ${plugin.name} 插件`"
          />
        </div>
        
        <div v-if="plugin.enabled" class="mt-4 pt-4 border-t border-surface-200 dark:border-surface-600">
          <div class="text-sm text-surface-600 dark:text-surface-400">
            插件已启用，挂载点将在相应位置显示
          </div>
        </div>
      </div>
    </div>

    <!-- Plugin Development -->
    <div class="mt-8 pt-6 border-t border-surface-200 dark:border-surface-700">
      <h4 class="font-medium text-surface-800 dark:text-surface-200 mb-4">开发者工具</h4>
      <div class="grid grid-cols-2 gap-3">
        <button class="p-3 text-sm text-surface-600 dark:text-surface-400 border border-surface-200 dark:border-surface-600 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors">
          <div class="font-medium mb-1">插件目录</div>
          <div class="text-xs opacity-75">打开插件文件夹</div>
        </button>
        <button class="p-3 text-sm text-surface-600 dark:text-surface-400 border border-surface-200 dark:border-surface-600 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors">
          <div class="font-medium mb-1">开发文档</div>
          <div class="text-xs opacity-75">查看API文档</div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { usePluginsStore } from '../../stores/plugins';
import ToggleSwitch from './base/ToggleSwitch.vue';

const pluginStore = usePluginsStore();
const { plugins } = storeToRefs(pluginStore);

async function toggle(id: string) {
  const plugin = plugins.value.find(p => p.id === id);
  if (!plugin) return;
  
  if (plugin.enabled) {
    await pluginStore.disable(id);
  } else {
    await pluginStore.enable(id);
  }
}

// Load plugins on mount
pluginStore.loadPlugins();
</script>