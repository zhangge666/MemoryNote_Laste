import { defineStore } from 'pinia';

export interface PluginManifestLite {
  id: string;
  name: string;
  version: string;
  author?: string;
  description?: string;
  mountPoints?: Record<string, any>;
  enabled: boolean;
}

export const usePluginsStore = defineStore('plugins', {
  state: () => ({
    items: [] as PluginManifestLite[],
    loading: false as boolean,
  }),
  getters: {
    plugins: (state) => state.items,
  },
  actions: {
    async loadPlugins() {
      this.loading = true;
      try {
        const list = await window.mn.ipc.invoke('plugins:scan');
        this.items = list as PluginManifestLite[];
      } catch (error) {
        console.warn('Failed to load plugins from IPC, using mock data:', error);
        // Fallback to mock data for development
        this.items = [
          {
            id: 'markdown-enhancer',
            name: 'Markdown 增强器',
            version: '1.2.0',
            author: 'MemoryNote Team',
            description: '为 Markdown 编辑器添加高级功能，包括表格编辑、数学公式和图表支持',
            enabled: true
          },
          {
            id: 'theme-manager',
            name: '主题管理器',
            version: '0.8.1',
            author: 'Community',
            description: '自定义编辑器主题和颜色方案，支持导入导出主题配置',
            enabled: false
          },
          {
            id: 'export-tools',
            name: '导出工具',
            version: '2.1.0',
            author: 'Third Party',
            description: '将笔记导出为 PDF、Word、HTML 等多种格式，支持批量导出',
            enabled: true
          }
        ];
      } finally {
        this.loading = false;
      }
    },
    async scan() {
      return this.loadPlugins();
    },
    async enable(id: string) {
      try {
        await window.mn.ipc.invoke('plugins:toggle', id, true);
      } catch (error) {
        console.warn('Failed to enable plugin via IPC:', error);
      }
      const p = this.items.find(i => i.id === id);
      if (p) p.enabled = true;
    },
    async disable(id: string) {
      try {
        await window.mn.ipc.invoke('plugins:toggle', id, false);
      } catch (error) {
        console.warn('Failed to disable plugin via IPC:', error);
      }
      const p = this.items.find(i => i.id === id);
      if (p) p.enabled = false;
    },
    async toggle(id: string, enable: boolean) {
      try {
        await window.mn.ipc.invoke('plugins:toggle', id, enable);
      } catch (error) {
        console.warn('Failed to toggle plugin via IPC:', error);
      }
      const p = this.items.find(i => i.id === id);
      if (p) p.enabled = enable;
    }
  }
});



