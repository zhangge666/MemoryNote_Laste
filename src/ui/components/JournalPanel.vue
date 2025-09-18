<template>
  <div class="h-full w-full overflow-auto p-8 bg-gradient-to-br from-slate-50 via-amber-50 to-orange-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-12">
        <div class="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
          </svg>
        </div>
        <h1 class="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-3">
          {{ t('journal.title') }}
        </h1>
        <p class="text-slate-600 dark:text-slate-400 text-lg">{{ t('journal.subtitle') }}</p>
      </div>

      <!-- Today's Entry Card -->
      <div class="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/50 dark:border-slate-700/50 mb-12 hover:shadow-lg transition-all duration-300">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-9 4v10a2 2 0 002 2h6a2 2 0 002-2V8M7 8h10"/>
              </svg>
            </div>
            <div>
              <h2 class="text-2xl font-bold text-slate-800 dark:text-slate-200">{{ todayDate }}</h2>
              <p class="text-slate-500 dark:text-slate-400">{{ todayWeekday }}</p>
            </div>
          </div>
          <button class="group bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-amber-500/25 transition-all duration-300" @click="createTodayEntry">
            <div class="flex items-center">
              <svg class="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              {{ t('journal.todayEntry') }}
            </div>
          </button>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ currentStreak }}</div>
            <div class="text-sm text-slate-500 dark:text-slate-400">连续记录天数</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-green-600 dark:text-green-400">{{ totalEntries }}</div>
            <div class="text-sm text-slate-500 dark:text-slate-400">总日记条数</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">{{ averageWords }}</div>
            <div class="text-sm text-slate-500 dark:text-slate-400">平均字数</div>
          </div>
        </div>
      </div>

      <!-- Coming Soon Badge -->
      <div class="text-center mb-12">
        <div class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full font-semibold shadow-lg shadow-amber-500/25">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          {{ t('journal.comingSoon') }}
        </div>
      </div>

      <!-- Feature Preview -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div class="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 text-center hover:shadow-lg transition-all duration-300">
          <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </div>
          <h3 class="font-semibold text-slate-800 dark:text-slate-200 mb-2">
            {{ t('journal.features.templates') }}
          </h3>
          <p class="text-sm text-slate-600 dark:text-slate-400">
            多种日记模板选择
          </p>
        </div>

        <div class="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 text-center hover:shadow-lg transition-all duration-300">
          <div class="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-9 4v10a2 2 0 002 2h6a2 2 0 002-2V8M7 8h10"/>
            </svg>
          </div>
          <h3 class="font-semibold text-slate-800 dark:text-slate-200 mb-2">
            {{ t('journal.features.calendar') }}
          </h3>
          <p class="text-sm text-slate-600 dark:text-slate-400">
            日历视图浏览历史
          </p>
        </div>

        <div class="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 text-center hover:shadow-lg transition-all duration-300">
          <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg class="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
          </div>
          <h3 class="font-semibold text-slate-800 dark:text-slate-200 mb-2">
            {{ t('journal.features.mood') }}
          </h3>
          <p class="text-sm text-slate-600 dark:text-slate-400">
            心情追踪与分析
          </p>
        </div>

        <div class="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 text-center hover:shadow-lg transition-all duration-300">
          <div class="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg class="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
          <h3 class="font-semibold text-slate-800 dark:text-slate-200 mb-2">
            {{ t('journal.features.search') }}
          </h3>
          <p class="text-sm text-slate-600 dark:text-slate-400">
            智能搜索日记内容
          </p>
        </div>
      </div>

      <!-- Recent Entries Placeholder -->
      <div class="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/50 dark:border-slate-700/50">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-semibold text-slate-800 dark:text-slate-200 flex items-center">
            <div class="w-6 h-6 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-lg mr-3"></div>
            最近的日记
          </h3>
          <button class="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
            查看全部
          </button>
        </div>
        
        <div class="text-center py-12">
          <div class="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
            </svg>
          </div>
          <div class="text-slate-500 dark:text-slate-400 mb-4">还没有日记记录</div>
          <button class="text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 font-medium transition-colors" @click="createTodayEntry">
            开始第一篇日记 →
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSettingsStore } from '../../stores/settings';
import { useTabGroupsStore } from '../../stores/tabgroups';

const { t } = useI18n();
const settings = useSettingsStore();
const tabs = useTabGroupsStore();

const todayDate = computed(() => {
  return new Date().toLocaleDateString('zh-CN', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
});

const todayWeekday = computed(() => {
  return new Date().toLocaleDateString('zh-CN', { weekday: 'long' });
});

// Placeholder data
const currentStreak = 0;
const totalEntries = 0;
const averageWords = 0;

async function createTodayEntry() {
  const today = new Date().toISOString().split('T')[0];
  const filename = `journal-${today}.md`;
  const workspacePath = settings.data?.workspacePath || '';
  const fullPath = `${workspacePath}/journal/${filename}`;
  
  const template = `# 日记 - ${todayDate.value}

## 🌤️ 今日心情
<!-- 今天的心情如何？ -->

## ✨ 今日亮点
<!-- 今天最美好的时刻是什么？ -->

## 🎯 完成的事情
<!-- 今天完成了哪些重要的事情？ -->

## 💭 思考与感悟
<!-- 今天有什么新的想法或感悟？ -->

## 📚 学到的东西
<!-- 今天学到了什么新知识？ -->

## 🔮 明日计划
<!-- 明天打算做什么？ -->

---
*创建时间: ${new Date().toLocaleString('zh-CN')}*
`;

  try {
    // Create journal directory if it doesn't exist
    await window.mn.ipc.invoke('file:create', `${workspacePath}/journal`, true);
    // Create the journal entry
    await window.mn.ipc.invoke('file:create', fullPath, false);
    // Write template content
    await window.mn.ipc.invoke('file:write', fullPath, template);
    // Open in editor
    tabs.open({ title: filename, path: fullPath, content: template });
  } catch (error) {
    console.error('Failed to create journal entry:', error);
    alert('创建日记失败');
  }
}
</script>