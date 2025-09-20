import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    sourcemap: true,
    commonjsOptions: {
      // 让 native 模块的内部动态 require 保持原样
      ignoreDynamicRequires: true,
    },
    rollupOptions: {
      // 将 better-sqlite3 作为外部依赖，避免被打包
      external: ['better-sqlite3'],
    },
  },
});
