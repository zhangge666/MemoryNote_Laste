<template>
  <div class="space-y-6">
    
    <!-- 外观模式设置 -->
    <div class="space-y-4">
      <!-- 系统主题检测 -->
      <div class="flex items-center justify-between">
        <div>
          <h4 class="text-lg font-semibold text-surface-800 dark:text-surface-200">跟随系统主题</h4>
          <p class="text-sm text-surface-600 dark:text-surface-400">自动根据系统外观切换浅色/深色模式</p>
        </div>
        <ToggleSwitch
          v-model="systemThemeDetection"
          aria-label="跟随系统主题"
        />
      </div>

      <!-- 手动模式切换 -->
      <div class="flex items-center justify-between" :class="{ 'opacity-50 pointer-events-none': themeStore.systemThemeDetection }">
        <div>
          <h4 class="text-lg font-semibold text-surface-800 dark:text-surface-200">外观模式</h4>
          <p class="text-sm text-surface-600 dark:text-surface-400">手动选择浅色或深色主题</p>
        </div>
        <ToggleSwitch
          v-model="darkMode"
          :disabled="themeStore.systemThemeDetection"
          aria-label="切换暗色模式"
        />
      </div>
    </div>

    <!-- 预置主题 -->
    <div>
      <h4 class="text-lg font-semibold text-surface-800 dark:text-surface-200 mb-4">预置主题</h4>
      <div class="grid grid-cols-2 gap-4">
        <div 
          v-for="theme in themeStore.allThemes" 
          :key="theme.id"
          @click="themeStore.setTheme(theme.id)"
          class="group relative p-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md"
          :class="themeStore.currentTheme === theme.id 
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
            : 'border-surface-200 dark:border-surface-700 hover:border-primary-300 dark:hover:border-primary-600'"
        >
          <!-- 主题预览色块 -->
          <div class="flex space-x-1 mb-3">
            <div 
              class="w-6 h-6 rounded-full"
              :style="{ backgroundColor: `rgb(${theme.colors.primary[500]})` }"
            />
            <div 
              class="w-6 h-6 rounded-full"
              :style="{ backgroundColor: `rgb(${theme.colors.accent[500]})` }"
            />
            <div 
              class="w-6 h-6 rounded-full border border-surface-200"
              :style="{ backgroundColor: `rgb(${theme.colors.surface[100]})` }"
            />
          </div>
          
          <div>
            <h5 class="font-medium text-surface-900 dark:text-surface-100">{{ theme.name }}</h5>
            <p v-if="theme.description" class="text-sm text-surface-500 dark:text-surface-400 mt-1">
              {{ theme.description }}
            </p>
          </div>
          
          <!-- 选中指示器 -->
          <div 
            v-if="themeStore.currentTheme === theme.id"
            class="absolute top-2 right-2 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center"
          >
            <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- 自定义主题管理 -->
    <div v-if="themeStore.customThemes.length > 0">
      <h4 class="text-lg font-semibold text-surface-800 dark:text-surface-200 mb-4">自定义主题</h4>
      <div class="grid grid-cols-2 gap-4">
        <div 
          v-for="theme in themeStore.customThemes" 
          :key="theme.id"
          class="group relative p-4 border-2 rounded-xl"
          :class="themeStore.currentTheme === theme.id 
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
            : 'border-surface-200 dark:border-surface-700'"
        >
          <!-- 主题预览色块 -->
          <div class="flex space-x-1 mb-3">
            <div 
              class="w-6 h-6 rounded-full"
              :style="{ backgroundColor: `rgb(${theme.colors.primary[500]})` }"
            />
            <div 
              class="w-6 h-6 rounded-full"
              :style="{ backgroundColor: `rgb(${theme.colors.accent[500]})` }"
            />
            <div 
              class="w-6 h-6 rounded-full border border-surface-200"
              :style="{ backgroundColor: `rgb(${theme.colors.surface[100]})` }"
            />
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium text-surface-900 dark:text-surface-100">{{ theme.name }}</h5>
            <p class="text-sm text-surface-500 dark:text-surface-400">自定义主题</p>
          </div>
          
          <!-- 操作按钮 -->
          <div class="flex space-x-2">
            <button 
              @click="themeStore.setTheme(theme.id)"
              class="flex-1 px-3 py-1 bg-primary-500 hover:bg-primary-600 text-white rounded text-sm transition-colors"
            >
              应用
            </button>
            <button 
              @click="removeTheme(theme.id)"
              class="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm transition-colors"
            >
              删除
            </button>
          </div>
          
          <!-- 选中指示器 -->
          <div 
            v-if="themeStore.currentTheme === theme.id"
            class="absolute top-2 right-2 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center"
          >
            <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- 主题导入导出 -->
    <div class="border-t border-surface-200 dark:border-surface-700 pt-6">
      <h4 class="text-lg font-semibold text-surface-800 dark:text-surface-200 mb-4">主题管理</h4>
      <div class="flex space-x-3">
        <button 
          @click="showImportDialog = true"
          class="px-4 py-2 bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600 text-surface-800 dark:text-surface-200 rounded-lg border border-surface-300 dark:border-surface-600 transition-colors"
        >
          导入主题
        </button>
        <button 
          @click="exportTheme(themeStore.currentTheme)"
          class="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
        >
          导出当前主题
        </button>
      </div>
    </div>

    <!-- 导入对话框 -->
    <div v-if="showImportDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-surface-800 rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
        <h3 class="text-lg font-semibold text-surface-800 dark:text-surface-200 mb-4">导入主题</h3>
        <textarea
          v-model="importText"
          class="w-full h-32 p-3 border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-700 text-surface-900 dark:text-surface-100 text-sm font-mono"
          placeholder="粘贴主题 JSON 数据..."
        ></textarea>
        <div class="flex justify-end space-x-3 mt-6">
          <button 
            @click="showImportDialog = false; importText = ''"
            class="px-4 py-2 bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600 text-surface-800 dark:text-surface-200 rounded-lg border border-surface-300 dark:border-surface-600 transition-colors"
          >
            取消
          </button>
          <button 
            @click="handleImport"
            class="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
          >
            导入
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useThemeStore, defaultThemes } from '../../stores/theme';
import ToggleSwitch from './base/ToggleSwitch.vue';

const themeStore = useThemeStore();
const showImportDialog = ref(false);
const importText = ref('');

// 创建计算属性来处理 v-model
const systemThemeDetection = computed({
  get: () => themeStore.systemThemeDetection,
  set: (value: boolean) => {
    themeStore.systemThemeDetection = value;
    if (value) {
      themeStore.detectSystemTheme();
    }
    setTimeout(() => themeStore.saveToSettings(), 100);
  }
});

const darkMode = computed({
  get: () => themeStore.isDarkMode,
  set: (value: boolean) => {
    themeStore.toggleDarkMode();
  }
});

// 组件挂载时初始化
onMounted(() => {
  // 确保主题已正确加载
  if (themeStore.allThemes.length === 0) {
    console.error('No themes found! This should not happen.');
  }
});


function exportTheme(themeId: string) {
  const themeData = themeStore.exportTheme(themeId);
  if (themeData) {
    // 创建下载链接
    const blob = new Blob([themeData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${themeId}-theme.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

function removeTheme(themeId: string) {
  if (confirm('确定要删除这个主题吗？')) {
    themeStore.removeCustomTheme(themeId);
  }
}

function handleImport() {
  try {
    const themeData = JSON.parse(importText.value);
    themeStore.importTheme(themeData);
    showImportDialog.value = false;
    importText.value = '';
    alert('主题导入成功！');
  } catch (error) {
    alert('导入失败：请检查 JSON 格式是否正确');
    console.error('Import error:', error);
  }
}
</script>