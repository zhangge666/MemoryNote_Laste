<template>
  <div class="space-y-8">
    <!-- Language & Theme Section -->
    <div class="space-y-6">
      <h4 class="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center">
        <div class="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mr-3"></div>
        外观与语言
      </h4>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-2">
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">
            {{ t('settings.language') }}
          </label>
          <div class="relative">
            <select 
              v-model="local.language" 
              class="w-full px-4 py-3 text-sm border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none cursor-pointer"
            >
              <option value="zh-CN">🇨🇳 中文简体</option>
              <option value="en-US">🇺🇸 English</option>
            </select>
            <svg class="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </div>
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">
            {{ t('settings.theme') }}
          </label>
          <div class="relative">
            <select 
              v-model="local.theme" 
              class="w-full px-4 py-3 text-sm border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none cursor-pointer"
            >
              <option value="system">🔄 跟随系统</option>
              <option value="light">☀️ 浅色模式</option>
              <option value="dark">🌙 深色模式</option>
            </select>
            <svg class="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Workspace Section -->
    <div class="space-y-6">
      <h4 class="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center">
        <div class="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg mr-3"></div>
        工作区设置
      </h4>
      
      <div class="space-y-4">
        <div class="space-y-2">
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">
            {{ t('settings.workspace') }}
          </label>
          <div class="flex gap-3">
            <input 
              v-model="local.workspacePath" 
              readonly 
              class="flex-1 px-4 py-3 text-sm border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 cursor-not-allowed"
            />
            <button 
              @click="chooseDir" 
              class="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-medium transition-colors flex items-center"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
              </svg>
              {{ t('settings.browse') }}
            </button>
          </div>
        </div>

        <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
          <div class="flex items-start">
            <svg class="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <div class="text-sm text-blue-800 dark:text-blue-200">
              <div class="font-medium mb-1">工作区说明</div>
              <div>这是您存储所有笔记和文档的根目录。更改工作区后，需要重新构建搜索索引。</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Editor Settings Section -->
    <div class="space-y-6">
      <h4 class="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center">
        <div class="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg mr-3"></div>
        编辑器设置
      </h4>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-2">
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">
            {{ t('settings.fontSize') }}
          </label>
          <div class="relative">
            <input 
              type="number" 
              min="10" 
              max="24" 
              v-model.number="local.editor.fontSize" 
              class="w-full px-4 py-3 text-sm border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
            <div class="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-slate-400">px</div>
          </div>
          <div class="text-xs text-slate-500 dark:text-slate-400">推荐范围: 12-18px</div>
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">
            {{ t('settings.lineHeight') }}
          </label>
          <div class="relative">
            <input 
              type="number" 
              step="0.1" 
              min="1" 
              max="2" 
              v-model.number="local.editor.lineHeight" 
              class="w-full px-4 py-3 text-sm border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
            <div class="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-slate-400">倍</div>
          </div>
          <div class="text-xs text-slate-500 dark:text-slate-400">推荐值: 1.4-1.8</div>
        </div>
      </div>

      <div class="space-y-2">
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {{ t('settings.autosave') }}
        </label>
        <div class="relative">
          <select 
            v-model="local.editor.autosave" 
            class="w-full px-4 py-3 text-sm border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all appearance-none cursor-pointer"
          >
            <option value="off">{{ t('settings.autosaveOff') }}</option>
            <option value="afterDelay">{{ t('settings.autosaveDelay') }}</option>
          </select>
          <svg class="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
          </svg>
        </div>
      </div>
    </div>

    <!-- Advanced Options Section -->
    <div class="space-y-6">
      <h4 class="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center">
        <div class="w-6 h-6 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg mr-3"></div>
        高级选项
      </h4>
      
      <div class="space-y-4">
        <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
          <div class="flex-1">
            <div class="text-sm font-medium text-slate-800 dark:text-slate-200 mb-1">
              {{ t('settings.keepSessionOnWorkspaceChange') }}
            </div>
            <div class="text-xs text-slate-500 dark:text-slate-400">
              切换工作区时保留当前打开的标签页和编辑状态
            </div>
          </div>
          <label class="relative inline-flex items-center cursor-pointer ml-4">
            <input 
              type="checkbox" 
              v-model="local.keepSessionOnWorkspaceChange" 
              class="sr-only peer"
            />
            <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 dark:peer-focus:ring-amber-800 rounded-full peer dark:bg-slate-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-amber-500"></div>
          </label>
        </div>
      </div>
    </div>

    <!-- Preview Section -->
    <div class="space-y-6">
      <h4 class="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center">
        <div class="w-6 h-6 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg mr-3"></div>
        编辑器预览
      </h4>
      
      <div class="border border-slate-200 dark:border-slate-700 rounded-xl p-6 bg-white dark:bg-slate-800">
        <div 
          class="text-slate-800 dark:text-slate-200" 
          :style="{ fontSize: local.editor.fontSize + 'px', lineHeight: local.editor.lineHeight }"
        >
          <div class="mb-4 font-semibold">示例文本预览</div>
          <div class="space-y-2 text-slate-600 dark:text-slate-400">
            <p>这是一段示例文本，用于预览当前的字体大小和行高设置。</p>
            <p>您可以调整上方的设置来查看实时效果。</p>
            <p>建议选择舒适的字体大小和适中的行高，以获得最佳的阅读体验。</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import { useSettingsStore } from '../../stores/settings';

const { t } = useI18n();
const settings = useSettingsStore();
const { data } = storeToRefs(settings);

const local = reactive({
  language: 'zh-CN',
  theme: 'system' as 'system' | 'light' | 'dark',
  workspacePath: '',
  editor: { fontSize: 14, lineHeight: 1.6, autosave: 'off' as 'off' | 'afterDelay' },
  keepSessionOnWorkspaceChange: true
});

let applying = false;
let lastSent = '';

watch(
  data,
  async (d) => {
    if (d) {
      applying = true;
      local.language = d.language;
      local.theme = d.theme;
      local.workspacePath = d.workspacePath;
      local.editor = { ...local.editor, ...d.editor } as any;
      local.keepSessionOnWorkspaceChange = !!d.session?.keepOnWorkspaceChange;
      await nextTick();
      applying = false;
    }
  },
  { immediate: true },
);

watch(
  () => ({ language: local.language, theme: local.theme, workspacePath: local.workspacePath, session: { keepOnWorkspaceChange: local.keepSessionOnWorkspaceChange }, editor: local.editor }),
  (val) => {
    if (applying) return;
    const payload = JSON.parse(JSON.stringify(val));
    const next = JSON.stringify(payload);
    if (next === lastSent) return;
    lastSent = next;
    settings.update(payload as any);
  },
  { deep: true },
);

async function chooseDir() {
  const dir = await window.mn.ipc.invoke('dialog:chooseDirectory');
  if (dir) {
    local.workspacePath = dir;
  }
}
</script>