<template>
  <div class="h-full w-full overflow-hidden bg-gradient-to-br from-surface-50 via-emerald-50 to-cyan-50 dark:from-surface-900 dark:via-surface-800 dark:to-surface-900">
    <div class="h-full flex">
      <!-- Settings Sidebar -->
      <div class="w-64 border-r border-surface-200 dark:border-surface-700 bg-white/70 dark:bg-surface-800/70 backdrop-blur-sm overflow-auto">
        <div class="p-6">
          <h2 class="text-xl font-bold text-surface-800 dark:text-surface-200 mb-6 flex items-center">
            <div class="w-8 h-8 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-xl flex items-center justify-center mr-3">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
            {{ t('settingsPage.title') }}
          </h2>
          
          <nav class="space-y-2">
            <button 
              v-for="item in settingsItems" 
              :key="item.key"
              :class="settingsBtnClass(item.key)"
              @click="activeSection = item.key"
            >
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon"/>
              </svg>
              {{ item.label }}
            </button>
          </nav>
        </div>
      </div>

      <!-- Settings Content -->
      <div class="flex-1 overflow-auto">
        <div class="p-8">
          <!-- General Settings -->
          <div v-if="activeSection === 'general'" class="max-w-4xl">
            <div class="mb-8">
              <h3 class="text-2xl font-bold text-surface-800 dark:text-surface-200 mb-2">基本设置</h3>
              <p class="text-surface-600 dark:text-surface-400">配置应用的基本功能和界面</p>
            </div>
            
            <div class="bg-white/70 dark:bg-surface-800/70 backdrop-blur-sm rounded-2xl border border-surface-200/50 dark:border-surface-700/50 p-6">
              <SettingsAutoSave />
            </div>

          </div>

          <!-- Editor Settings -->
          <div v-else-if="activeSection === 'editor'" class="max-w-4xl">
            <div class="mb-8">
              <h3 class="text-2xl font-bold text-surface-800 dark:text-surface-200 mb-2">编辑器设置</h3>
              <p class="text-surface-600 dark:text-surface-400">自定义编辑器的外观和行为</p>
            </div>
            
            <div class="space-y-6">
              <div class="bg-white/70 dark:bg-surface-800/70 backdrop-blur-sm rounded-2xl border border-surface-200/50 dark:border-surface-700/50 p-6">
                <h4 class="text-lg font-semibold text-surface-800 dark:text-surface-200 mb-4">编辑器外观</h4>
                <div class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Slider
                      v-model="editorSettings.fontSize"
                      :min="10"
                      :max="24"
                      :step="1"
                      label="字体大小"
                      unit="px"
                      description="推荐范围: 12-18px"
                    />
                    <Slider
                      v-model="editorSettings.lineHeight"
                      :min="1.0"
                      :max="2.0"
                      :step="0.1"
                      label="行高"
                      unit="倍"
                      description="推荐值: 1.4-1.8"
                    />
                  </div>
                  
                  <div class="flex items-center justify-between">
                    <div>
                      <div class="text-sm font-medium text-surface-700 dark:text-surface-300">显示预览</div>
                      <div class="text-xs text-surface-500 dark:text-surface-400">显示编辑器预览面板</div>
                    </div>
                    <ToggleSwitch
                      v-model="editorSettings.showPreview"
                      aria-label="显示预览"
                    />
                  </div>
                </div>
              </div>

              <!-- 编辑器预览 -->
              <div v-if="editorSettings.showPreview" class="bg-white/70 dark:bg-surface-800/70 backdrop-blur-sm rounded-2xl border border-surface-200/50 dark:border-surface-700/50 p-6">
                <h4 class="text-lg font-semibold text-surface-800 dark:text-surface-200 mb-4">编辑器预览</h4>
                <div class="border border-surface-200 dark:border-surface-600 rounded-xl overflow-hidden">
                  <div class="bg-surface-50 dark:bg-surface-700 px-4 py-2 border-b border-surface-200 dark:border-surface-600">
                    <div class="flex items-center space-x-2">
                      <div class="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span class="ml-4 text-sm text-surface-600 dark:text-surface-400">示例文档.md</span>
                    </div>
                  </div>
                  <div 
                    class="p-4 bg-white dark:bg-surface-800 min-h-[200px]"
                    :style="{
                      fontSize: editorSettings.fontSize + 'px',
                      lineHeight: editorSettings.lineHeight
                    }"
                  >
                    <div class="text-surface-900 dark:text-surface-100 space-y-4">
                      <h1 class="text-2xl font-bold">Markdown 示例</h1>
                      <p>这是一个示例段落，用于预览编辑器的字体大小和行高设置。</p>
                      <ul class="list-disc list-inside space-y-1">
                        <li>列表项目 1</li>
                        <li>列表项目 2</li>
                        <li>列表项目 3</li>
                      </ul>
                      <blockquote class="border-l-4 border-primary-500 pl-4 italic text-surface-600 dark:text-surface-400">
                        这是一个引用块，展示文本的渲染效果。
                      </blockquote>
                      <pre class="bg-surface-100 dark:bg-surface-700 p-3 rounded-lg text-sm"><code>console.log('Hello, World!');</code></pre>
                    </div>
                  </div>
                </div>
              </div>

              <div class="bg-white/70 dark:bg-surface-800/70 backdrop-blur-sm rounded-2xl border border-surface-200/50 dark:border-surface-700/50 p-6">
                <h4 class="text-lg font-semibold text-surface-800 dark:text-surface-200 mb-4">编辑行为</h4>
                <div class="space-y-4">
                  <div class="flex items-center justify-between">
                    <div>
                      <div class="text-sm font-medium text-surface-700 dark:text-surface-300">自动保存</div>
                      <div class="text-xs text-surface-500 dark:text-surface-400">编辑后自动保存文件</div>
                    </div>
                    <ToggleSwitch
                      v-model="autosaveEnabled"
                      aria-label="自动保存"
                    />
                  </div>
                  <div class="flex items-center justify-between">
                    <div>
                      <div class="text-sm font-medium text-surface-700 dark:text-surface-300">自动换行</div>
                      <div class="text-xs text-surface-500 dark:text-surface-400">长行自动换行显示</div>
                    </div>
                    <ToggleSwitch
                      v-model="editorSettings.wordWrap"
                      aria-label="自动换行"
                    />
                  </div>
                  <div class="flex items-center justify-between">
                    <div>
                      <div class="text-sm font-medium text-surface-700 dark:text-surface-300">显示行号</div>
                      <div class="text-xs text-surface-500 dark:text-surface-400">在编辑器左侧显示行号</div>
                    </div>
                    <ToggleSwitch
                      v-model="editorSettings.showLineNumbers"
                      aria-label="显示行号"
                    />
                  </div>
                  <div class="flex items-center justify-between">
                    <div>
                      <div class="text-sm font-medium text-surface-700 dark:text-surface-300">语法高亮</div>
                      <div class="text-xs text-surface-500 dark:text-surface-400">Markdown 语法高亮</div>
                    </div>
                    <ToggleSwitch
                      v-model="editorSettings.syntaxHighlight"
                      aria-label="语法高亮"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- AI Settings -->
          <div v-else-if="activeSection === 'ai'" class="max-w-4xl">
            <div class="mb-8">
              <h3 class="text-2xl font-bold text-surface-800 dark:text-surface-200 mb-2">AI 设置</h3>
              <p class="text-surface-600 dark:text-surface-400">配置搜索、问答和智能功能</p>
            </div>
            
            <div class="space-y-6">
              <div class="bg-white/70 dark:bg-surface-800/70 backdrop-blur-sm rounded-2xl border border-surface-200/50 dark:border-surface-700/50 p-6">
                <h4 class="text-lg font-semibold text-surface-800 dark:text-surface-200 mb-4">LLM 配置</h4>
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">提供商</label>
                    <Dropdown
                      v-model="llmSettings.provider"
                      :options="llmProviderOptions"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">API 端点</label>
                    <input type="text" v-model="llmSettings.baseURL" class="w-full px-4 py-3 text-sm border border-surface-300 dark:border-surface-600 rounded-xl bg-white dark:bg-surface-700 text-surface-900 dark:text-surface-100 focus:border-primary-500 transition-all" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">模型名称</label>
                    <input type="text" v-model="llmSettings.model" class="w-full px-4 py-3 text-sm border border-surface-300 dark:border-surface-600 rounded-xl bg-white dark:bg-surface-700 text-surface-900 dark:text-surface-100 focus:border-primary-500 transition-all" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">嵌入模型</label>
                    <input type="text" v-model="llmSettings.embedModel" class="w-full px-4 py-3 text-sm border border-surface-300 dark:border-surface-600 rounded-xl bg-white dark:bg-surface-700 text-surface-900 dark:text-surface-100 focus:border-primary-500 transition-all" />
                  </div>
                </div>
              </div>

              <div class="bg-white/70 dark:bg-surface-800/70 backdrop-blur-sm rounded-2xl border border-surface-200/50 dark:border-surface-700/50 p-6">
                <h4 class="text-lg font-semibold text-surface-800 dark:text-surface-200 mb-4">搜索配置</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">检索结果数量</label>
                    <input type="number" min="1" max="20" v-model.number="searchConfig.topK" class="w-full px-4 py-3 text-sm border border-surface-300 dark:border-surface-600 rounded-xl bg-white dark:bg-surface-700 text-surface-900 dark:text-surface-100 focus:border-primary-500 transition-all" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">相似度阈值</label>
                    <input type="number" min="0" max="1" step="0.1" v-model.number="searchConfig.similarityThreshold" class="w-full px-4 py-3 text-sm border border-surface-300 dark:border-surface-600 rounded-xl bg-white dark:bg-surface-700 text-surface-900 dark:text-surface-100 focus:border-primary-500 transition-all" />
                  </div>
                </div>
                <div class="mt-4 space-y-3">
                  <div class="flex items-center justify-between">
                    <div>
                      <div class="text-sm font-medium text-surface-700 dark:text-surface-300">自动重建索引</div>
                      <div class="text-xs text-surface-500 dark:text-surface-400">文件变更时自动更新搜索索引</div>
                    </div>
                    <ToggleSwitch
                      v-model="searchSettings.autoRebuildIndex"
                      aria-label="自动重建索引"
                    />
                  </div>
                  <div class="flex items-center justify-between">
                    <div>
                      <div class="text-sm font-medium text-surface-700 dark:text-surface-300">混合检索</div>
                      <div class="text-xs text-surface-500 dark:text-surface-400">结合全文搜索和语义搜索</div>
                    </div>
                    <ToggleSwitch
                      v-model="searchSettings.hybridSearch"
                      aria-label="混合检索"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Plugin Management -->
          <div v-else-if="activeSection === 'plugins'" class="max-w-4xl">
            <div class="mb-8">
              <h3 class="text-2xl font-bold text-surface-800 dark:text-surface-200 mb-2">插件管理</h3>
              <p class="text-surface-600 dark:text-surface-400">管理已安装的插件和扩展功能</p>
            </div>
            
            <div class="space-y-6">
              <!-- Plugin List -->
              <div class="bg-white/70 dark:bg-surface-800/70 backdrop-blur-sm rounded-2xl border border-surface-200/50 dark:border-surface-700/50 p-6">
                <div class="flex items-center justify-between mb-6">
                  <h4 class="text-lg font-semibold text-surface-800 dark:text-surface-200">已安装插件</h4>
                  <button class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                    </svg>
                    安装插件
                  </button>
                </div>

                <div v-if="!plugins || plugins.length === 0" class="text-center py-12">
                  <div class="w-16 h-16 bg-surface-100 dark:bg-surface-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                    </svg>
                  </div>
                  <div class="text-surface-500 dark:text-surface-400 mb-4">暂无已安装的插件</div>
                  <button class="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors">
                    浏览插件市场 →
                  </button>
                </div>

                <div v-else class="space-y-4">
                  <div 
                    v-for="plugin in plugins" 
                    :key="plugin.id" 
                    class="border border-surface-200 dark:border-surface-600 rounded-xl p-6 hover:shadow-md transition-all"
                  >
                    <div class="flex items-start justify-between">
                      <div class="flex items-start space-x-4">
                        <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                          <div class="w-6 h-6 bg-white rounded-lg"></div>
                        </div>
                        <div class="flex-1">
                          <div class="flex items-center space-x-3 mb-2">
                            <h5 class="font-semibold text-surface-800 dark:text-surface-200">{{ plugin.name }}</h5>
                            <span class="px-2 py-1 bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-400 text-xs rounded-full">v{{ plugin.version }}</span>
                            <span v-if="plugin.enabled" class="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full">已启用</span>
                          </div>
                          <p class="text-sm text-surface-600 dark:text-surface-400 mb-3">{{ plugin.description }}</p>
                          <div class="flex items-center space-x-4 text-xs text-surface-500 dark:text-surface-400">
                            <span>作者: {{ plugin.author }}</span>
                            <span>•</span>
                            <span>更新时间: 2024-09-17</span>
                          </div>
                        </div>
                      </div>
                      <div class="flex items-center space-x-3">
                        <button class="px-3 py-1.5 text-sm text-surface-600 dark:text-surface-400 hover:text-surface-800 dark:hover:text-surface-200 border border-surface-300 dark:border-surface-600 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors">
                          配置
                        </button>
                        <ToggleSwitch
                          :model-value="plugin.enabled"
                          @update:model-value="togglePlugin(plugin.id)"
                          :aria-label="`切换 ${plugin.name} 插件`"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Plugin Development -->
              <div class="bg-white/70 dark:bg-surface-800/70 backdrop-blur-sm rounded-2xl border border-surface-200/50 dark:border-surface-700/50 p-6">
                <h4 class="text-lg font-semibold text-surface-800 dark:text-surface-200 mb-4">开发者工具</h4>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button class="p-4 text-left border border-surface-200 dark:border-surface-600 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors">
                    <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-3">
                      <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
                      </svg>
                    </div>
                    <div class="font-medium text-surface-800 dark:text-surface-200 mb-1">插件目录</div>
                    <div class="text-sm text-surface-500 dark:text-surface-400">打开插件文件夹</div>
                  </button>
                  <button class="p-4 text-left border border-surface-200 dark:border-surface-600 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors">
                    <div class="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-3">
                      <svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                      </svg>
                    </div>
                    <div class="font-medium text-surface-800 dark:text-surface-200 mb-1">开发文档</div>
                    <div class="text-sm text-surface-500 dark:text-surface-400">查看 API 文档</div>
                  </button>
                  <button class="p-4 text-left border border-surface-200 dark:border-surface-600 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors">
                    <div class="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-3">
                      <svg class="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
                      </svg>
                    </div>
                    <div class="font-medium text-surface-800 dark:text-surface-200 mb-1">创建插件</div>
                    <div class="text-sm text-surface-500 dark:text-surface-400">插件开发向导</div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Advanced Settings -->
          <div v-else-if="activeSection === 'advanced'" class="max-w-4xl">
            <div class="mb-8">
              <h3 class="text-2xl font-bold text-surface-800 dark:text-surface-200 mb-2">高级设置</h3>
              <p class="text-surface-600 dark:text-surface-400">系统级配置和实验性功能</p>
            </div>
            
            <div class="space-y-6">
              <div class="bg-white/70 dark:bg-surface-800/70 backdrop-blur-sm rounded-2xl border border-surface-200/50 dark:border-surface-700/50 p-6">
                <h4 class="text-lg font-semibold text-surface-800 dark:text-surface-200 mb-4">性能设置</h4>
                <div class="space-y-4">
                  <div class="flex items-center justify-between">
                    <div>
                      <div class="text-sm font-medium text-surface-700 dark:text-surface-300">启用硬件加速</div>
                      <div class="text-xs text-surface-500 dark:text-surface-400">使用 GPU 加速渲染</div>
                    </div>
                    <ToggleSwitch
                      v-model="advancedSettings.gpuAcceleration"
                      aria-label="启用硬件加速"
                    />
                  </div>
                  <div class="flex items-center justify-between">
                    <div>
                      <div class="text-sm font-medium text-surface-700 dark:text-surface-300">预加载文件</div>
                      <div class="text-xs text-surface-500 dark:text-surface-400">启动时预加载常用文件</div>
                    </div>
                    <ToggleSwitch
                      v-model="advancedSettings.preloadFiles"
                      aria-label="预加载文件"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">内存缓存大小 (MB)</label>
                    <input type="number" min="100" max="2000" v-model.number="advancedSettings.memoryCacheSize" class="w-32 px-4 py-3 text-sm border border-surface-300 dark:border-surface-600 rounded-xl bg-white dark:bg-surface-700 text-surface-900 dark:text-surface-100 focus:border-primary-500 transition-all" />
                  </div>
                </div>
              </div>

              <div class="bg-white/70 dark:bg-surface-800/70 backdrop-blur-sm rounded-2xl border border-surface-200/50 dark:border-surface-700/50 p-6">
                <h4 class="text-lg font-semibold text-surface-800 dark:text-surface-200 mb-4">安全设置</h4>
                <div class="space-y-4">
                  <div class="flex items-center justify-between">
                    <div>
                      <div class="text-sm font-medium text-surface-700 dark:text-surface-300">启用插件沙箱</div>
                      <div class="text-xs text-surface-500 dark:text-surface-400">限制插件的系统访问权限</div>
                    </div>
                    <ToggleSwitch
                      v-model="advancedSettings.sandboxPlugins"
                      aria-label="启用插件沙箱"
                    />
                  </div>
                  <div class="flex items-center justify-between">
                    <div>
                      <div class="text-sm font-medium text-surface-700 dark:text-surface-300">自动更新检查</div>
                      <div class="text-xs text-surface-500 dark:text-surface-400">定期检查应用更新</div>
                    </div>
                    <ToggleSwitch
                      v-model="advancedSettings.autoUpdate"
                      aria-label="自动更新检查"
                    />
                  </div>
                  <div class="flex items-center justify-between">
                    <div>
                      <div class="text-sm font-medium text-surface-700 dark:text-surface-300">匿名使用统计</div>
                      <div class="text-xs text-surface-500 dark:text-surface-400">帮助改进产品（不包含个人数据）</div>
                    </div>
                    <ToggleSwitch
                      v-model="advancedSettings.analytics"
                      aria-label="匿名使用统计"
                    />
                  </div>
                </div>
              </div>

              <div class="bg-white/70 dark:bg-surface-800/70 backdrop-blur-sm rounded-2xl border border-surface-200/50 dark:border-surface-700/50 p-6">
                <h4 class="text-lg font-semibold text-surface-800 dark:text-surface-200 mb-4">实验性功能</h4>
                <div class="space-y-4">
                  <div class="flex items-center justify-between">
                    <div>
                      <div class="text-sm font-medium text-surface-700 dark:text-surface-300">增量索引</div>
                      <div class="text-xs text-surface-500 dark:text-surface-400">文件变更时自动更新索引</div>
                    </div>
                    <ToggleSwitch
                      v-model="advancedSettings.autoIndexing"
                      aria-label="增量索引"
                    />
                  </div>
                  <div class="flex items-center justify-between">
                    <div>
                      <div class="text-sm font-medium text-surface-700 dark:text-surface-300">智能建议</div>
                      <div class="text-xs text-surface-500 dark:text-surface-400">基于 AI 的内容建议</div>
                    </div>
                    <ToggleSwitch
                      v-model="advancedSettings.aiSuggestions"
                      aria-label="智能建议"
                    />
                  </div>
                  <div class="flex items-center justify-between">
                    <div>
                      <div class="text-sm font-medium text-surface-700 dark:text-surface-300">协作模式</div>
                      <div class="text-xs text-surface-500 dark:text-surface-400">多人实时协作编辑</div>
                    </div>
                    <ToggleSwitch
                      v-model="advancedSettings.collaboration"
                      aria-label="协作模式"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- About -->
          <div v-else-if="activeSection === 'about'" class="max-w-4xl">
            <div class="mb-8">
              <h3 class="text-2xl font-bold text-surface-800 dark:text-surface-200 mb-2">关于 MemoryNote</h3>
              <p class="text-surface-600 dark:text-surface-400">版本信息和系统状态</p>
            </div>
            
            <div class="space-y-6">
              <div class="bg-white/70 dark:bg-surface-800/70 backdrop-blur-sm rounded-2xl border border-surface-200/50 dark:border-surface-700/50 p-8">
                <div class="flex items-start space-x-6">
                  <div class="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center flex-shrink-0">
                    <div class="w-10 h-10 bg-white rounded-xl"></div>
                  </div>
                  <div class="flex-1">
                    <h4 class="text-2xl font-bold text-surface-800 dark:text-surface-200 mb-2">MemoryNote</h4>
                    <p class="text-surface-600 dark:text-surface-400 mb-4">{{ t('settingsPage.description') }}</p>
                    <div class="flex items-center space-x-6 text-sm text-surface-500 dark:text-surface-400 mb-6">
                      <span>{{ t('settingsPage.version') }} 1.0.0</span>
                      <span>•</span>
                      <span>Electron + Vue 3</span>
                      <span>•</span>
                      <span>Built with ❤️</span>
                    </div>
                    <div class="flex flex-wrap gap-3">
                      <button class="flex items-center px-4 py-2 text-sm font-medium text-surface-600 dark:text-surface-400 hover:text-surface-800 dark:hover:text-surface-200 border border-surface-200 dark:border-surface-600 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                        </svg>
                        {{ t('settingsPage.actions.viewLogs') }}
                      </button>
                      <button class="flex items-center px-4 py-2 text-sm font-medium text-surface-600 dark:text-surface-400 hover:text-surface-800 dark:hover:text-surface-200 border border-surface-200 dark:border-surface-600 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                        </svg>
                        {{ t('settingsPage.actions.exportSettings') }}
                      </button>
                      <button 
                        @click="resetToFactory" 
                        class="flex items-center px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                        </svg>
                        恢复出厂设置
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="bg-white/70 dark:bg-surface-800/70 backdrop-blur-sm rounded-2xl border border-surface-200/50 dark:border-surface-700/50 p-6">
                <h4 class="text-lg font-semibold text-surface-800 dark:text-surface-200 mb-4">系统信息</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div class="p-4 bg-surface-50 dark:bg-surface-700/50 rounded-xl">
                    <div class="text-surface-500 dark:text-surface-400 mb-1">操作系统</div>
                    <div class="font-medium text-surface-700 dark:text-surface-300">Windows 11</div>
                  </div>
                  <div class="p-4 bg-surface-50 dark:bg-surface-700/50 rounded-xl">
                    <div class="text-surface-500 dark:text-surface-400 mb-1">Node.js</div>
                    <div class="font-medium text-surface-700 dark:text-surface-300">v18.17.0</div>
                  </div>
                  <div class="p-4 bg-surface-50 dark:bg-surface-700/50 rounded-xl">
                    <div class="text-surface-500 dark:text-surface-400 mb-1">Electron</div>
                    <div class="font-medium text-surface-700 dark:text-surface-300">v28.1.1</div>
                  </div>
                  <div class="p-4 bg-surface-50 dark:bg-surface-700/50 rounded-xl">
                    <div class="text-surface-500 dark:text-surface-400 mb-1">Chrome</div>
                    <div class="font-medium text-surface-700 dark:text-surface-300">v120.0.6099</div>
                  </div>
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
import { ref, computed, watch, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { usePluginsStore } from '../../stores/plugins';
import { useSettingsStore } from '../../stores/settings';
import SettingsAutoSave from './SettingsAutoSave.vue';
import ToggleSwitch from './base/ToggleSwitch.vue';
import Slider from './base/Slider.vue';
import Dropdown from './base/Dropdown.vue';

const { t } = useI18n();
const pluginStore = usePluginsStore();
const { plugins } = storeToRefs(pluginStore);

// Settings store
const settingsStore = useSettingsStore();

const activeSection = ref('general');

// Editor settings state - 从 settings store 初始化
const editorSettings = ref({
  // 基础设置
  fontSize: 14,
  lineHeight: 1.6,
  autosave: 'off' as 'off' | 'afterDelay',
  // 行为设置
  wordWrap: true,
  showLineNumbers: false,
  syntaxHighlight: true,
  // 预览控制
  showPreview: false
});

// 自动保存的计算属性，用于开关控制
const autosaveEnabled = computed({
  get: () => editorSettings.value.autosave === 'afterDelay',
  set: (value: boolean) => {
    editorSettings.value.autosave = value ? 'afterDelay' : 'off';
  }
});

// Search settings state - 从 settings store 初始化
const searchSettings = ref({
  autoRebuildIndex: true,
  hybridSearch: false
});

// Advanced settings state - 从 settings store 初始化
const advancedSettings = ref({
  gpuAcceleration: true,
  preloadFiles: false,
  sandboxPlugins: true,
  autoUpdate: false,
  analytics: false,
  autoIndexing: false,
  aiSuggestions: false,
  collaboration: false,
  memoryCacheSize: 500
});

// LLM 设置状态
const llmSettings = ref({
  provider: 'ollama',
  baseURL: 'http://localhost:11434',
  model: 'llama3.1:8b',
  embedModel: 'nomic-embed-text'
});

// 搜索配置状态（数值输入）
const searchConfig = ref({
  topK: 8,
  similarityThreshold: 0.7
});

// 下拉选项定义
const llmProviderOptions = [
  { value: 'ollama', label: 'Ollama (本地)' },
  { value: 'openai', label: 'OpenAI' },
  { value: 'claude', label: 'Claude' },
  { value: 'gemini', label: 'Gemini' }
];

const settingsItems = [
  {
    key: 'general',
    label: '基本设置',
    icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z'
  },
  {
    key: 'editor',
    label: '编辑器',
    icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
  },
  {
    key: 'ai',
    label: 'AI 设置',
    icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z'
  },
  {
    key: 'plugins',
    label: '插件管理',
    icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
  },
  {
    key: 'advanced',
    label: '高级设置',
    icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100-4m0 4v2m0-6V4'
  },
  {
    key: 'about',
    label: '关于',
    icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
  }
];

function settingsBtnClass(key: string) {
  const active = activeSection.value === key;
  return `w-full flex items-center px-4 py-3 text-left rounded-xl transition-all duration-200 ${
    active 
      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' 
      : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700 hover:text-surface-800 dark:hover:text-surface-200'
  }`;
}

async function togglePlugin(id: string) {
  const plugin = plugins.value.find(p => p.id === id);
  if (!plugin) return;
  
  if (plugin.enabled) {
    await pluginStore.disable(id);
  } else {
    await pluginStore.enable(id);
  }
}

// 恢复出厂设置函数
async function resetToFactory() {
  if (!confirm('确定要恢复出厂设置吗？这将清除所有自定义配置并重新启动应用程序。')) {
    return;
  }
  
  try {
    // 直接调用后端的重置函数，让后端处理所有逻辑
    await window.mn.ipc.invoke('settings:resetToFactory');
    
    // 显示成功消息
    alert('设置已恢复到出厂状态，应用程序将重新启动。');
    
    // 等待一小段时间确保设置文件写入完成
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 重新启动应用
    await window.mn.ipc.invoke('app:restart');
  } catch (error) {
    console.error('恢复出厂设置失败:', error);
    alert('恢复出厂设置失败，请重试。');
  }
}

// 初始化设置
async function initializeSettings() {
  await settingsStore.load();
  
  if (settingsStore.data) {
    // 从 settings store 加载编辑器设置
    if (settingsStore.data.editor) {
      editorSettings.value = {
        // 基础设置
        fontSize: settingsStore.data.editor.fontSize ?? 14,
        lineHeight: settingsStore.data.editor.lineHeight ?? 1.6,
        autosave: settingsStore.data.editor.autosave ?? 'off',
        // 行为设置
        wordWrap: settingsStore.data.editor.wordWrap ?? true,
        showLineNumbers: settingsStore.data.editor.showLineNumbers ?? false,
        syntaxHighlight: settingsStore.data.editor.syntaxHighlight ?? true,
        // 预览控制
        showPreview: settingsStore.data.editor.showPreview ?? false
      };
    }
    
    // 从 settings store 加载搜索设置
    if (settingsStore.data.search) {
      searchSettings.value = {
        autoRebuildIndex: settingsStore.data.search.autoRebuildIndex ?? true,
        hybridSearch: settingsStore.data.search.hybridSearch ?? false
      };
    }
    
    // 从 settings store 加载高级设置
    if (settingsStore.data.advanced) {
      advancedSettings.value = {
        gpuAcceleration: settingsStore.data.advanced.gpuAcceleration ?? true,
        preloadFiles: settingsStore.data.advanced.preloadFiles ?? false,
        sandboxPlugins: settingsStore.data.advanced.sandboxPlugins ?? true,
        autoUpdate: settingsStore.data.advanced.autoUpdate ?? false,
        analytics: settingsStore.data.advanced.analytics ?? false,
        autoIndexing: settingsStore.data.advanced.autoIndexing ?? false,
        aiSuggestions: settingsStore.data.advanced.aiSuggestions ?? false,
        collaboration: settingsStore.data.advanced.collaboration ?? false,
        memoryCacheSize: settingsStore.data.advanced.memoryCacheSize ?? 500
      };
    }
    
    // 从 settings store 加载 LLM 设置
    if (settingsStore.data.llm) {
      llmSettings.value = {
        provider: settingsStore.data.llm.provider ?? 'ollama',
        baseURL: settingsStore.data.llm.baseURL ?? 'http://localhost:11434',
        model: settingsStore.data.llm.model ?? 'llama3.1:8b',
        embedModel: settingsStore.data.llm.embedModel ?? 'nomic-embed-text'
      };
    }
    
    // 从 settings store 加载搜索配置
    if (settingsStore.data.search) {
      searchConfig.value = {
        topK: settingsStore.data.search.topK ?? 8,
        similarityThreshold: settingsStore.data.search.similarityThreshold ?? 0.7
      };
    }
  }
}

// 监听设置变化并保存
watch(editorSettings, async (newValue) => {
  if (settingsStore.data) {
    await settingsStore.update({
      editor: {
        ...settingsStore.data.editor,
        ...newValue
      }
    });
  }
}, { deep: true });

watch(searchSettings, async (newValue) => {
  if (settingsStore.data) {
    await settingsStore.update({
      search: {
        ...settingsStore.data.search,
        ...newValue
      }
    });
  }
}, { deep: true });

watch(advancedSettings, async (newValue) => {
  if (settingsStore.data) {
    await settingsStore.update({
      advanced: newValue
    });
  }
}, { deep: true });

watch(llmSettings, async (newValue) => {
  if (settingsStore.data) {
    await settingsStore.update({
      llm: {
        provider: newValue.provider,
        baseURL: newValue.baseURL,
        model: newValue.model,
        embedModel: newValue.embedModel
      }
    });
  }
}, { deep: true });

watch(searchConfig, async (newValue) => {
  if (settingsStore.data) {
    await settingsStore.update({
      search: {
        ...settingsStore.data.search,
        topK: newValue.topK,
        similarityThreshold: newValue.similarityThreshold
      }
    });
  }
}, { deep: true });

// 组件挂载时初始化
onMounted(async () => {
  await initializeSettings();
pluginStore.loadPlugins();
});
</script>
