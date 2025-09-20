import { defineStore } from 'pinia';

export interface AppSettings {
  workspacePath: string;
  language: string;
  theme: {
    current: string;
    darkMode: boolean;
    systemThemeDetection: boolean;
    customThemes: any[];
  };
  editor: { 
    fontSize: number; 
    lineHeight: number; 
    autosave: 'off' | 'afterDelay';
    // 新增编辑器行为设置
    wordWrap?: boolean;
    showLineNumbers?: boolean;
    syntaxHighlight?: boolean;
    // 预览控制
    showPreview?: boolean;
  };
  search: { 
    provider: 'local'; 
    topK: number;
    // 新增搜索配置
    autoRebuildIndex?: boolean;
    hybridSearch?: boolean;
    similarityThreshold?: number;
  };
  llm: { provider: string; baseURL: string; model: string; embedModel?: string };
  review?: { autoMode: 'manual' | 'auto-all' | 'auto-tagged' };
  // 新增高级设置
  advanced?: {
    gpuAcceleration?: boolean;
    preloadFiles?: boolean;
    sandboxPlugins?: boolean;
    autoUpdate?: boolean;
    analytics?: boolean;
    autoIndexing?: boolean;
    aiSuggestions?: boolean;
    collaboration?: boolean;
    memoryCacheSize?: number;
  };
}

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    loading: false as boolean,
    data: null as AppSettings | null,
  }),
  actions: {
    async load() {
      console.log('🔧 Settings store: Starting to load settings');
      this.loading = true;
      try {
        console.log('📡 Settings store: Invoking settings:get IPC');
        const res = await window.mn.ipc.invoke('settings:get');
        console.log('📦 Settings store: Received data:', res);
        console.log('📊 Settings store: Data keys:', Object.keys(res || {}));
        this.data = res as AppSettings;
        console.log('✅ Settings store: Successfully loaded settings');
      } catch (error) {
        console.error('❌ Settings store: Failed to load settings:', error);
        this.data = null;
      } finally {
        this.loading = false;
        console.log('🏁 Settings store: Load process completed');
      }
    },
    async update(partial: Partial<AppSettings>) {
      // Ensure sending a plain, cloneable object (strip Vue proxies)
      const plain = JSON.parse(JSON.stringify(partial));
      const next = await window.mn.ipc.invoke('settings:set', plain);
      this.data = next as AppSettings;
    },
  },
});


