<template>
  <div class="h-7 border-t border-surface-200 dark:border-surface-700 text-xs flex items-center justify-between px-4 bg-white/95 dark:bg-surface-800/95 backdrop-blur-sm">
    <div class="flex items-center space-x-4">
      <div class="flex items-center space-x-2">
        <div class="w-2 h-2 bg-green-500 rounded-full"></div>
        <span class="text-surface-600 dark:text-surface-400">{{ statusText }}</span>
      </div>
      <div class="text-surface-500 dark:text-surface-400">|</div>
      <div class="text-surface-600 dark:text-surface-400">
        {{ indexStatus }}
      </div>
    </div>
    
    <div class="flex items-center space-x-4">
      <div v-if="active" class="flex items-center space-x-3">
        <div class="flex items-center space-x-2">
          <svg class="w-3 h-3 text-surface-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          <span class="text-surface-600 dark:text-surface-400">
            {{ active.title }}
            <span v-if="active.dirty" class="text-orange-500">*</span>
          </span>
        </div>
        
        <div class="text-surface-500 dark:text-surface-400">|</div>
        
        <div class="flex items-center space-x-2">
          <svg class="w-3 h-3 text-surface-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          <span class="text-surface-600 dark:text-surface-400">{{ cursorText }}</span>
        </div>
        
        <div class="text-surface-500 dark:text-surface-400">|</div>
        
        <div class="flex items-center space-x-2">
          <svg class="w-3 h-3 text-surface-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1l-4 4z"/>
          </svg>
          <span class="text-surface-600 dark:text-surface-400">{{ wordsText }}</span>
        </div>
      </div>
      <!-- Save button removed per request -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useEditorStore } from '../../stores/editor';
import { useTabGroupsStore } from '../../stores/tabgroups';

const { t } = useI18n();
const editor = useEditorStore();
const tabs = useTabGroupsStore();
const active = computed(() => tabs.activeTab);

const statusText = computed(() => t('status.connected'));
const cursorText = computed(() => `Ln ${editor.cursorLine}, Col ${editor.cursorColumn}`);
const wordsText = computed(() => `Words ${editor.wordCount}`);
const indexStatus = computed(() => 'Index Ready');

// Periodic snapshot
onMounted(() => {
  setInterval(() => editor.snapshotActive(), 1000);
});
</script>