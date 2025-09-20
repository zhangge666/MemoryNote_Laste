<template>
  <div class="space-y-8">
    <!-- Language & Theme Section -->
    <div class="space-y-6">
      <h4 class="text-lg font-semibold text-surface-800 dark:text-surface-200 flex items-center">
        <div class="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mr-3"></div>
        外观与语言
      </h4>
      
      <div class="space-y-6">
        <!-- 语言选择 -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-surface-700 dark:text-surface-300">
            {{ t('settings.language') }}
          </label>
          <Dropdown
            v-model="local.language"
            :options="languageOptions"
          />
        </div>

        <!-- 外观主题 -->
        <div class="space-y-4">
          <h5 class="text-base font-medium text-surface-800 dark:text-surface-200">外观主题</h5>
          <ThemeSelector />
        </div>
      </div>
    </div>

    <!-- Workspace Section -->
    <div class="space-y-6">
      <h4 class="text-lg font-semibold text-surface-800 dark:text-surface-200 flex items-center">
        <div class="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg mr-3"></div>
        工作区设置
      </h4>
      
      <div class="space-y-4">
        <div class="space-y-2">
          <label class="block text-sm font-medium text-surface-700 dark:text-surface-300">
            {{ t('settings.workspace') }}
          </label>
          <div class="flex gap-3">
            <input 
              v-model="local.workspacePath" 
              readonly 
              class="flex-1 px-4 py-3 text-sm border border-surface-300 dark:border-surface-600 rounded-xl bg-surface-50 dark:bg-surface-800 text-surface-900 dark:text-surface-100 cursor-not-allowed"
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


    <!-- Advanced Options Section -->
    <div class="space-y-6">
      <h4 class="text-lg font-semibold text-surface-800 dark:text-surface-200 flex items-center">
        <div class="w-6 h-6 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg mr-3"></div>
        高级选项
      </h4>
      
      <div class="space-y-4">
        <div class="flex items-center justify-between p-4 bg-surface-50 dark:bg-surface-800/50 rounded-xl border border-surface-200 dark:border-surface-700">
          <div class="flex-1">
            <div class="text-sm font-medium text-surface-800 dark:text-surface-200 mb-1">复习自动更新</div>
            <div class="text-xs text-surface-500 dark:text-surface-400">保存笔记后如何处理复习内容：手动、全部自动、仅带标记自动</div>
          </div>
          <div class="ml-4 w-40">
            <Dropdown
              v-model="local.reviewMode"
              :options="reviewModeOptions"
            />
          </div>
        </div>
        <div class="flex items-center justify-between p-4 bg-surface-50 dark:bg-surface-800/50 rounded-xl border border-surface-200 dark:border-surface-700">
          <div class="flex-1">
            <div class="text-sm font-medium text-surface-800 dark:text-surface-200 mb-1">
              {{ t('settings.keepSessionOnWorkspaceChange') }}
            </div>
            <div class="text-xs text-surface-500 dark:text-surface-400">
              切换工作区时保留当前打开的标签页和编辑状态
            </div>
          </div>
          <ToggleSwitch
            v-model="local.keepSessionOnWorkspaceChange"
            aria-label="切换工作区时保持会话"
          />
        </div>
      </div>
    </div>

    <!-- Preview Section -->
    <div class="space-y-6">
      <h4 class="text-lg font-semibold text-surface-800 dark:text-surface-200 flex items-center">
        <div class="w-6 h-6 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg mr-3"></div>
        编辑器预览
      </h4>
      
      <div class="border border-surface-200 dark:border-surface-700 rounded-xl p-6 bg-white dark:bg-surface-800">
        <div 
          class="text-surface-800 dark:text-surface-200" 
          :style="{ fontSize: local.editor.fontSize + 'px', lineHeight: local.editor.lineHeight }"
        >
          <div class="mb-4 font-semibold">示例文本预览</div>
          <div class="space-y-2 text-surface-600 dark:text-surface-400">
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
import ThemeSelector from './ThemeSelector.vue';
import ToggleSwitch from './base/ToggleSwitch.vue';
import Dropdown from './base/Dropdown.vue';

const { t } = useI18n();
const settings = useSettingsStore();
const { data } = storeToRefs(settings);

// 下拉选项定义
const languageOptions = [
  { value: 'zh-CN', label: '🇨🇳 中文简体' },
  { value: 'en-US', label: '🇺🇸 English' }
];

const reviewModeOptions = [
  { value: 'manual', label: '手动' },
  { value: 'auto-all', label: '全部自动' },
  { value: 'auto-tagged', label: '仅带标记' }
];

const local = reactive({
  language: 'zh-CN',
  workspacePath: '',
  editor: { fontSize: 14, lineHeight: 1.6, autosave: 'off' as 'off' | 'afterDelay' },
  keepSessionOnWorkspaceChange: true,
  reviewMode: 'manual' as 'manual' | 'auto-all' | 'auto-tagged',
});

let applying = false;
let lastSent = '';

watch(
  data,
  async (d) => {
    if (d) {
      applying = true;
      local.language = d.language;
      local.workspacePath = d.workspacePath;
      local.editor = { ...local.editor, ...d.editor } as any;
      local.keepSessionOnWorkspaceChange = !!d.session?.keepOnWorkspaceChange;
      local.reviewMode = (d.review?.autoMode as any) || 'manual';
      await nextTick();
      applying = false;
    }
  },
  { immediate: true },
);

watch(
  () => ({ language: local.language, workspacePath: local.workspacePath, session: { keepOnWorkspaceChange: local.keepSessionOnWorkspaceChange }, editor: local.editor, review: { autoMode: local.reviewMode } }),
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
