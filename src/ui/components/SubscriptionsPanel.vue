<template>
  <div class="h-full w-full overflow-auto p-8 bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-12">
        <div class="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zM4 19h10a1 1 0 001-1v-8a1 1 0 00-1-1H4a1 1 0 00-1 1v8a1 1 0 001 1z"/>
          </svg>
        </div>
        <h1 class="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3">
          {{ t('subscriptions.title') }}
        </h1>
        <p class="text-slate-600 dark:text-slate-400 text-lg">{{ t('subscriptions.subtitle') }}</p>
      </div>

      <!-- Coming Soon Badge -->
      <div class="text-center mb-12">
        <div class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-full font-semibold shadow-lg shadow-purple-500/25">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          {{ t('subscriptions.comingSoon') }}
        </div>
      </div>

      <!-- Feature Preview -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div class="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/50 dark:border-slate-700/50 text-center hover:shadow-lg transition-all duration-300">
          <div class="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg class="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-3">
            {{ t('subscriptions.features.watch') }}
          </h3>
          <p class="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            实时监控指定文件夹的变更，自动发现新增或修改的文件
          </p>
        </div>

        <div class="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/50 dark:border-slate-700/50 text-center hover:shadow-lg transition-all duration-300">
          <div class="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg class="w-8 h-8 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 4v10a2 2 0 002 2h6a2 2 0 002-2V8M7 8h10M9 12h6m-6 4h6"/>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-3">
            {{ t('subscriptions.features.rss') }}
          </h3>
          <p class="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            集成RSS订阅源，将外部内容自动同步到本地知识库
          </p>
        </div>

        <div class="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/50 dark:border-slate-700/50 text-center hover:shadow-lg transition-all duration-300">
          <div class="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg class="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-3">
            {{ t('subscriptions.features.notifications') }}
          </h3>
          <p class="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            通过邮件或系统通知及时获知内容更新
          </p>
        </div>
      </div>

      <!-- Placeholder Content -->
      <div class="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/50 dark:border-slate-700/50">
        <div class="text-center py-12">
          <div class="w-24 h-24 bg-slate-100 dark:bg-slate-700 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <svg class="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-3">订阅管理器</h3>
          <p class="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
            在这里您将能够管理所有的订阅源，设置监控规则，并查看更新历史
          </p>
          <div class="flex flex-wrap justify-center gap-3">
            <span class="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-full text-sm">文件监控</span>
            <span class="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-full text-sm">RSS订阅</span>
            <span class="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-full text-sm">邮件通知</span>
            <span class="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-full text-sm">自动同步</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>