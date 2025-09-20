import { defineStore } from 'pinia';

export interface ThemeConfig {
  id: string;
  name: string;
  author?: string;
  version?: string;
  description?: string;
  colors: {
    primary: {
      50: string;
      100: string;
      500: string;
      600: string;
      700: string;
    };
    accent: {
      50: string;
      100: string;
      500: string;
      600: string;
      700: string;
    };
    surface: {
      50: string;
      100: string;
      200: string;
      700: string;
      800: string;
      900: string;
    };
  };
  fonts?: {
    family?: string;
    editorSize?: string;
    editorLineHeight?: string;
  };
  shadows?: {
    sm?: string;
    md?: string;
    lg?: string;
  };
  borderRadius?: {
    default?: string;
    lg?: string;
  };
}

// 预置主题
export const defaultThemes: ThemeConfig[] = [
  {
    id: 'default',
    name: '默认',
    colors: {
      primary: {
        50: '239 246 255',
        100: '219 234 254',
        500: '59 130 246',
        600: '37 99 235',
        700: '29 78 216',
      },
      accent: {
        50: '250 245 255',
        100: '243 232 255',
        500: '147 51 234',
        600: '126 34 206',
        700: '109 40 217',
      },
      surface: {
        50: '248 250 252',
        100: '241 245 249',
        200: '226 232 240',
        700: '51 65 85',
        800: '30 41 59',
        900: '15 23 42',
      }
    }
  },
  {
    id: 'green',
    name: '绿意',
    author: 'MemoryNote Team',
    description: '清新绿色主题',
    colors: {
      primary: {
        50: '236 253 245',
        100: '209 250 229',
        500: '34 197 94',
        600: '22 163 74',
        700: '21 128 61',
      },
      accent: {
        50: '240 253 250',
        100: '204 251 241',
        500: '20 184 166',
        600: '13 148 136',
        700: '15 118 110',
      },
      surface: {
        50: '248 250 252',
        100: '241 245 249',
        200: '226 232 240',
        700: '51 65 85',
        800: '30 41 59',
        900: '15 23 42',
      }
    }
  },
  {
    id: 'purple',
    name: '紫韵',
    author: 'MemoryNote Team', 
    description: '优雅紫色主题',
    colors: {
      primary: {
        50: '250 245 255',
        100: '243 232 255',
        500: '147 51 234',
        600: '126 34 206',
        700: '109 40 217',
      },
      accent: {
        50: '253 244 255',
        100: '250 232 255',
        500: '192 38 211',
        600: '168 85 247',
        700: '147 51 234',
      },
      surface: {
        50: '248 250 252',
        100: '241 245 249',
        200: '226 232 240',
        700: '51 65 85',
        800: '30 41 59',
        900: '15 23 42',
      }
    }
  },
  {
    id: 'orange',
    name: '暖阳',
    author: 'MemoryNote Team',
    description: '温暖橙色主题',
    colors: {
      primary: {
        50: '255 247 237',
        100: '255 237 213',
        500: '249 115 22',
        600: '234 88 12',
        700: '194 65 12',
      },
      accent: {
        50: '254 252 232',
        100: '254 249 195',
        500: '245 158 11',
        600: '217 119 6',
        700: '180 83 9',
      },
      surface: {
        50: '248 250 252',
        100: '241 245 249',
        200: '226 232 240',
        700: '51 65 85',
        800: '30 41 59',
        900: '15 23 42',
      }
    }
  }
];

export const useThemeStore = defineStore('theme', {
  state: () => ({
    currentTheme: 'default' as string,
    customThemes: [] as ThemeConfig[],
    isDarkMode: false as boolean,
    systemThemeDetection: true as boolean,
  }),
  getters: {
    allThemes(state): ThemeConfig[] {
      return [...defaultThemes, ...state.customThemes];
    },
    activeTheme(state): ThemeConfig | null {
      return this.allThemes.find((t: ThemeConfig) => t.id === state.currentTheme) || defaultThemes[0];
    },
  },
  actions: {
    setTheme(themeId: string) {
      const theme = this.allThemes.find((t: ThemeConfig) => t.id === themeId);
      if (!theme) {
        console.error('Theme not found:', themeId);
        return;
      }
      
      console.log('Switching to theme:', theme.name);
      this.currentTheme = themeId;
      this.applyTheme(theme);
      
      // 延迟保存到设置，避免并发问题
      setTimeout(() => this.saveToSettings(), 100);
    },
    
    applyTheme(theme: ThemeConfig) {
      const root = document.documentElement;
      console.log('Applying theme:', theme.name, theme.colors);
      
      // 直接应用颜色到所有Tailwind类
      this.applyColorsToDom(theme);
      
      // 应用CSS变量作为备份
      Object.entries(theme.colors.primary).forEach(([key, value]) => {
        root.style.setProperty(`--color-primary-${key}`, value);
      });
      
      Object.entries(theme.colors.accent).forEach(([key, value]) => {
        root.style.setProperty(`--color-accent-${key}`, value);
      });
      
      Object.entries(theme.colors.surface).forEach(([key, value]) => {
        root.style.setProperty(`--color-surface-${key}`, value);
      });
      
      // 应用字体设置到全局
      if (theme.fonts?.family) {
        root.style.setProperty('--font-family', theme.fonts.family);
      }
      if (theme.fonts?.editorSize) {
        root.style.setProperty('--editor-font-size', theme.fonts.editorSize);
      }
      if (theme.fonts?.editorLineHeight) {
        root.style.setProperty('--editor-line-height', theme.fonts.editorLineHeight);
      }
      
      // 应用阴影到全局
      if (theme.shadows?.sm) {
        root.style.setProperty('--shadow-sm', theme.shadows.sm);
      }
      if (theme.shadows?.md) {
        root.style.setProperty('--shadow', theme.shadows.md);
      }
      if (theme.shadows?.lg) {
        root.style.setProperty('--shadow-lg', theme.shadows.lg);
      }
      
      // 应用圆角到全局
      if (theme.borderRadius?.default) {
        root.style.setProperty('--border-radius', theme.borderRadius.default);
      }
      if (theme.borderRadius?.lg) {
        root.style.setProperty('--border-radius-lg', theme.borderRadius.lg);
      }
      
      // 触发重新渲染
      document.body.setAttribute('data-theme', theme.id);
      console.log('Theme applied successfully to document root');
    },
    
    applyColorsToDom(theme: ThemeConfig) {
      // 创建动态样式表覆盖Tailwind颜色
      let styleSheet = document.getElementById('dynamic-theme-styles') as HTMLStyleElement;
      if (!styleSheet) {
        styleSheet = document.createElement('style');
        styleSheet.id = 'dynamic-theme-styles';
        document.head.appendChild(styleSheet);
      }
      
      const css = `
        /* ===== PRIMARY COLORS ===== */
        .bg-primary-50 { background-color: rgb(${theme.colors.primary[50]}) !important; }
        .bg-primary-100 { background-color: rgb(${theme.colors.primary[100]}) !important; }
        .bg-primary-500 { background-color: rgb(${theme.colors.primary[500]}) !important; }
        .bg-primary-600 { background-color: rgb(${theme.colors.primary[600]}) !important; }
        .bg-primary-700 { background-color: rgb(${theme.colors.primary[700]}) !important; }
        
        .text-primary-50 { color: rgb(${theme.colors.primary[50]}) !important; }
        .text-primary-100 { color: rgb(${theme.colors.primary[100]}) !important; }
        .text-primary-300 { color: rgb(${theme.colors.primary[100]}) !important; }
        .text-primary-400 { color: rgb(${theme.colors.primary[500]}) !important; }
        .text-primary-500 { color: rgb(${theme.colors.primary[500]}) !important; }
        .text-primary-600 { color: rgb(${theme.colors.primary[600]}) !important; }
        .text-primary-700 { color: rgb(${theme.colors.primary[700]}) !important; }
        
        .border-primary-200 { border-color: rgb(${theme.colors.primary[100]}) !important; }
        .border-primary-500 { border-color: rgb(${theme.colors.primary[500]}) !important; }
        .border-primary-700 { border-color: rgb(${theme.colors.primary[700]}) !important; }
        
        /* ===== ACCENT COLORS ===== */
        .bg-accent-50 { background-color: rgb(${theme.colors.accent[50]}) !important; }
        .bg-accent-100 { background-color: rgb(${theme.colors.accent[100]}) !important; }
        .bg-accent-500 { background-color: rgb(${theme.colors.accent[500]}) !important; }
        .bg-accent-600 { background-color: rgb(${theme.colors.accent[600]}) !important; }
        .bg-accent-700 { background-color: rgb(${theme.colors.accent[700]}) !important; }
        
        .text-accent-500 { color: rgb(${theme.colors.accent[500]}) !important; }
        .text-accent-600 { color: rgb(${theme.colors.accent[600]}) !important; }
        .text-accent-700 { color: rgb(${theme.colors.accent[700]}) !important; }
        
        .border-accent-500 { border-color: rgb(${theme.colors.accent[500]}) !important; }
        
        /* ===== SURFACE COLORS ===== */
        .bg-surface-50 { background-color: rgb(${theme.colors.surface[50]}) !important; }
        .bg-surface-100 { background-color: rgb(${theme.colors.surface[100]}) !important; }
        .bg-surface-200 { background-color: rgb(${theme.colors.surface[200]}) !important; }
        .bg-surface-700 { background-color: rgb(${theme.colors.surface[700]}) !important; }
        .bg-surface-800 { background-color: rgb(${theme.colors.surface[800]}) !important; }
        .bg-surface-900 { background-color: rgb(${theme.colors.surface[900]}) !important; }
        
        .text-surface-50 { color: rgb(${theme.colors.surface[50]}) !important; }
        .text-surface-100 { color: rgb(${theme.colors.surface[100]}) !important; }
        .text-surface-200 { color: rgb(${theme.colors.surface[200]}) !important; }
        .text-surface-300 { color: rgb(${theme.colors.surface[200]}) !important; }
        .text-surface-400 { color: rgb(${theme.colors.surface[200]}) !important; }
        .text-surface-500 { color: rgb(${theme.colors.surface[700]}) !important; }
        .text-surface-600 { color: rgb(${theme.colors.surface[700]}) !important; }
        .text-surface-700 { color: rgb(${theme.colors.surface[700]}) !important; }
        .text-surface-800 { color: rgb(${theme.colors.surface[800]}) !important; }
        .text-surface-900 { color: rgb(${theme.colors.surface[900]}) !important; }
        
        .border-surface-200 { border-color: rgb(${theme.colors.surface[200]}) !important; }
        .border-surface-300 { border-color: rgb(${theme.colors.surface[200]}) !important; }
        .border-surface-600 { border-color: rgb(${theme.colors.surface[700]}) !important; }
        .border-surface-700 { border-color: rgb(${theme.colors.surface[700]}) !important; }
        
        /* ===== LEGACY COLOR MAPPINGS ===== */
        .bg-blue-100 { background-color: rgb(${theme.colors.primary[100]}) !important; }
        .bg-blue-500 { background-color: rgb(${theme.colors.primary[500]}) !important; }
        .bg-blue-600 { background-color: rgb(${theme.colors.primary[600]}) !important; }
        .text-blue-500 { color: rgb(${theme.colors.primary[500]}) !important; }
        .text-blue-600 { color: rgb(${theme.colors.primary[600]}) !important; }
        .text-blue-700 { color: rgb(${theme.colors.primary[700]}) !important; }
        .text-blue-400 { color: rgb(${theme.colors.primary[500]}) !important; }
        .text-blue-300 { color: rgb(${theme.colors.primary[100]}) !important; }
        
        .bg-purple-100 { background-color: rgb(${theme.colors.accent[100]}) !important; }
        .bg-purple-500 { background-color: rgb(${theme.colors.accent[500]}) !important; }
        .bg-purple-600 { background-color: rgb(${theme.colors.accent[600]}) !important; }
        .text-purple-600 { color: rgb(${theme.colors.accent[600]}) !important; }
        .text-purple-400 { color: rgb(${theme.colors.accent[500]}) !important; }
        
        .bg-green-100 { background-color: rgb(${theme.colors.primary[100]}) !important; }
        .bg-green-500 { background-color: rgb(${theme.colors.primary[500]}) !important; }
        .text-green-600 { color: rgb(${theme.colors.primary[600]}) !important; }
        .text-green-700 { color: rgb(${theme.colors.primary[700]}) !important; }
        .text-green-400 { color: rgb(${theme.colors.primary[500]}) !important; }
        
        .bg-emerald-100 { background-color: rgb(${theme.colors.primary[100]}) !important; }
        .bg-emerald-500 { background-color: rgb(${theme.colors.primary[500]}) !important; }
        .text-emerald-600 { color: rgb(${theme.colors.primary[600]}) !important; }
        .text-emerald-400 { color: rgb(${theme.colors.primary[500]}) !important; }
        
        .bg-amber-100 { background-color: rgb(${theme.colors.accent[100]}) !important; }
        .bg-amber-500 { background-color: rgb(${theme.colors.accent[500]}) !important; }
        .text-amber-600 { color: rgb(${theme.colors.accent[600]}) !important; }
        .text-amber-400 { color: rgb(${theme.colors.accent[500]}) !important; }
        
        .bg-orange-100 { background-color: rgb(${theme.colors.accent[100]}) !important; }
        .bg-orange-400 { background-color: rgb(${theme.colors.accent[500]}) !important; }
        .bg-pink-500 { background-color: rgb(${theme.colors.accent[500]}) !important; }
        
        /* ===== DARK MODE LEGACY MAPPINGS ===== */
        .dark .dark\\:bg-blue-900\\/30 { background-color: rgb(${theme.colors.primary[700]} / 0.3) !important; }
        .dark .dark\\:bg-green-900\\/30 { background-color: rgb(${theme.colors.primary[700]} / 0.3) !important; }
        .dark .dark\\:bg-purple-900\\/30 { background-color: rgb(${theme.colors.accent[700]} / 0.3) !important; }
        .dark .dark\\:text-blue-400 { color: rgb(${theme.colors.primary[500]}) !important; }
        .dark .dark\\:text-blue-300 { color: rgb(${theme.colors.primary[100]}) !important; }
        .dark .dark\\:text-green-400 { color: rgb(${theme.colors.primary[500]}) !important; }
        .dark .dark\\:text-purple-400 { color: rgb(${theme.colors.accent[500]}) !important; }
        
        /* ===== WHITE/BLACK BACKGROUNDS (theme aware) ===== */
        .bg-white { background-color: rgb(${theme.colors.surface[50]}) !important; }
        .bg-white\\/95 { background-color: rgb(${theme.colors.surface[50]} / 0.95) !important; }
        .bg-white\\/70 { background-color: rgb(${theme.colors.surface[50]} / 0.7) !important; }
        .text-white { color: white !important; }
        .bg-black { background-color: rgb(${theme.colors.surface[900]}) !important; }
        .text-black { color: rgb(${theme.colors.surface[900]}) !important; }
        
        .bg-slate-50 { background-color: rgb(${theme.colors.surface[50]}) !important; }
        .bg-slate-100 { background-color: rgb(${theme.colors.surface[100]}) !important; }
        .bg-slate-200 { background-color: rgb(${theme.colors.surface[200]}) !important; }
        
        /* ===== NAVIGATION AND SIDEBAR FIXES ===== */
        .titlebar { background-color: rgb(${theme.colors.surface[50]} / 0.95) !important; }
        .drag { backdrop-filter: blur(8px) !important; }
        
        /* ===== LAYOUT CONTAINERS - IMPORTANT OVERRIDE ===== */
        .w-16 { background-color: rgb(${theme.colors.surface[50]}) !important; }
        .w-64 { background-color: rgb(${theme.colors.surface[50]} / 0.7) !important; }
        .h-full { background-color: rgb(${theme.colors.surface[50]}) !important; }
        div.w-16 { background-color: rgb(${theme.colors.surface[50]}) !important; }
        div.w-64 { background-color: rgb(${theme.colors.surface[50]} / 0.7) !important; }
        div.h-full { background-color: rgb(${theme.colors.surface[50]}) !important; }
        
        .dark .w-16 { background-color: rgb(${theme.colors.surface[800]}) !important; }
        .dark .w-64 { background-color: rgb(${theme.colors.surface[800]} / 0.7) !important; }
        .dark .h-full { background-color: rgb(${theme.colors.surface[800]}) !important; }
        .dark div.w-16 { background-color: rgb(${theme.colors.surface[800]}) !important; }
        .dark div.w-64 { background-color: rgb(${theme.colors.surface[800]} / 0.7) !important; }
        .dark div.h-full { background-color: rgb(${theme.colors.surface[800]}) !important; }
        
        /* ===== BORDER OVERRIDES ===== */
        .border-surface-200\\/50 { border-color: rgb(${theme.colors.surface[200]} / 0.5) !important; }
        .border-surface-300 { border-color: rgb(${theme.colors.surface[200]}) !important; }
        .border-surface-600 { border-color: rgb(${theme.colors.surface[700]}) !important; }
        .dark .dark\\:border-surface-600 { border-color: rgb(${theme.colors.surface[700]}) !important; }
        .dark .dark\\:border-surface-700\\/50 { border-color: rgb(${theme.colors.surface[700]} / 0.5) !important; }
        
        /* ===== HOVER STATES ===== */
        .hover\\:bg-surface-100:hover { background-color: rgb(${theme.colors.surface[100]}) !important; }
        .hover\\:bg-surface-200:hover { background-color: rgb(${theme.colors.surface[200]}) !important; }
        .hover\\:bg-surface-700:hover { background-color: rgb(${theme.colors.surface[700]}) !important; }
        .hover\\:bg-primary-600:hover { background-color: rgb(${theme.colors.primary[600]}) !important; }
        .hover\\:bg-primary-700:hover { background-color: rgb(${theme.colors.primary[700]}) !important; }
        .hover\\:bg-blue-600:hover { background-color: rgb(${theme.colors.primary[600]}) !important; }
        .hover\\:bg-blue-700:hover { background-color: rgb(${theme.colors.primary[700]}) !important; }
        .hover\\:bg-purple-600:hover { background-color: rgb(${theme.colors.accent[600]}) !important; }
        .hover\\:bg-purple-700:hover { background-color: rgb(${theme.colors.accent[700]}) !important; }
        
        .hover\\:text-surface-800:hover { color: rgb(${theme.colors.surface[800]}) !important; }
        .hover\\:text-surface-200:hover { color: rgb(${theme.colors.surface[200]}) !important; }
        .hover\\:text-primary-700:hover { color: rgb(${theme.colors.primary[700]}) !important; }
        .hover\\:text-primary-300:hover { color: rgb(${theme.colors.primary[100]}) !important; }
        .hover\\:text-blue-600:hover { color: rgb(${theme.colors.primary[600]}) !important; }
        .hover\\:text-blue-700:hover { color: rgb(${theme.colors.primary[700]}) !important; }
        .hover\\:text-purple-600:hover { color: rgb(${theme.colors.accent[600]}) !important; }
        .hover\\:text-purple-700:hover { color: rgb(${theme.colors.accent[700]}) !important; }
        
        /* ===== DARK MODE OVERRIDES ===== */
        .dark .dark\\:bg-surface-800 { background-color: rgb(${theme.colors.surface[800]}) !important; }
        .dark .dark\\:bg-surface-900 { background-color: rgb(${theme.colors.surface[900]}) !important; }
        .dark .dark\\:bg-surface-700 { background-color: rgb(${theme.colors.surface[700]}) !important; }
        .dark .dark\\:bg-slate-800 { background-color: rgb(${theme.colors.surface[800]}) !important; }
        .dark .dark\\:bg-slate-900 { background-color: rgb(${theme.colors.surface[900]}) !important; }
        .dark .dark\\:bg-slate-700 { background-color: rgb(${theme.colors.surface[700]}) !important; }
        
        .dark .dark\\:text-surface-100 { color: rgb(${theme.colors.surface[100]}) !important; }
        .dark .dark\\:text-surface-200 { color: rgb(${theme.colors.surface[200]}) !important; }
        .dark .dark\\:text-surface-300 { color: rgb(${theme.colors.surface[200]}) !important; }
        .dark .dark\\:text-surface-400 { color: rgb(${theme.colors.surface[200]}) !important; }
        .dark .dark\\:text-slate-100 { color: rgb(${theme.colors.surface[100]}) !important; }
        .dark .dark\\:text-slate-200 { color: rgb(${theme.colors.surface[200]}) !important; }
        .dark .dark\\:text-slate-300 { color: rgb(${theme.colors.surface[200]}) !important; }
        .dark .dark\\:text-slate-400 { color: rgb(${theme.colors.surface[200]}) !important; }
        
        .dark .dark\\:border-surface-700 { border-color: rgb(${theme.colors.surface[700]}) !important; }
        .dark .dark\\:border-slate-700 { border-color: rgb(${theme.colors.surface[700]}) !important; }
        .dark .dark\\:border-slate-600 { border-color: rgb(${theme.colors.surface[700]}) !important; }
        
        .dark .dark\\:hover\\:bg-surface-700:hover { background-color: rgb(${theme.colors.surface[700]}) !important; }
        .dark .dark\\:hover\\:bg-slate-700:hover { background-color: rgb(${theme.colors.surface[700]}) !important; }
        .dark .dark\\:hover\\:bg-surface-600:hover { background-color: rgb(${theme.colors.surface[700]}) !important; }
        .dark .dark\\:hover\\:bg-slate-600:hover { background-color: rgb(${theme.colors.surface[700]}) !important; }
        
        .dark .dark\\:hover\\:text-surface-200:hover { color: rgb(${theme.colors.surface[200]}) !important; }
        .dark .dark\\:hover\\:text-slate-200:hover { color: rgb(${theme.colors.surface[200]}) !important; }
        
        /* ===== GRADIENTS ===== */
        .bg-gradient-to-br { background: linear-gradient(to bottom right, rgb(${theme.colors.primary[500]}), rgb(${theme.colors.accent[600]})) !important; }
        .from-blue-500 { --tw-gradient-from: rgb(${theme.colors.primary[500]}) !important; }
        .to-purple-600 { --tw-gradient-to: rgb(${theme.colors.accent[600]}) !important; }
        .from-primary-500 { --tw-gradient-from: rgb(${theme.colors.primary[500]}) !important; }
        .to-accent-600 { --tw-gradient-to: rgb(${theme.colors.accent[600]}) !important; }
        .from-emerald-500 { --tw-gradient-from: rgb(${theme.colors.primary[500]}) !important; }
        .to-cyan-600 { --tw-gradient-to: rgb(${theme.colors.primary[600]}) !important; }
        .from-surface-50 { --tw-gradient-from: rgb(${theme.colors.surface[50]}) !important; }
        .via-emerald-50 { --tw-gradient-via: rgb(${theme.colors.primary[50]}) !important; }
        .to-cyan-50 { --tw-gradient-to: rgb(${theme.colors.primary[50]}) !important; }
        
        /* ===== DARK MODE GRADIENTS ===== */
        .dark .dark\\:from-surface-900 { --tw-gradient-from: rgb(${theme.colors.surface[900]}) !important; }
        .dark .dark\\:via-surface-800 { --tw-gradient-via: rgb(${theme.colors.surface[800]}) !important; }
        .dark .dark\\:to-surface-900 { --tw-gradient-to: rgb(${theme.colors.surface[900]}) !important; }
        
        /* ===== SHADOW COLORS ===== */
        .shadow-primary-500\\/25 { box-shadow: 0 10px 15px -3px rgb(${theme.colors.primary[500]} / 0.25) !important; }
        .shadow-blue-500\\/25 { box-shadow: 0 10px 15px -3px rgb(${theme.colors.primary[500]} / 0.25) !important; }
        .shadow-emerald-500\\/25 { box-shadow: 0 10px 15px -3px rgb(${theme.colors.primary[500]} / 0.25) !important; }
        .shadow-lg { box-shadow: 0 10px 15px -3px rgb(${theme.colors.surface[900]} / 0.1), 0 4px 6px -2px rgb(${theme.colors.surface[900]} / 0.05) !important; }
        .shadow-md { box-shadow: 0 4px 6px -1px rgb(${theme.colors.surface[900]} / 0.1), 0 2px 4px -1px rgb(${theme.colors.surface[900]} / 0.06) !important; }
        .hover\\:shadow-md:hover { box-shadow: 0 4px 6px -1px rgb(${theme.colors.surface[900]} / 0.1), 0 2px 4px -1px rgb(${theme.colors.surface[900]} / 0.06) !important; }
        
        /* ===== ADDITIONAL COLOR MAPPINGS ===== */
        .bg-red-100 { background-color: rgb(${theme.colors.accent[100]}) !important; }
        .bg-red-500 { background-color: rgb(${theme.colors.accent[500]}) !important; }
        .bg-red-600 { background-color: rgb(${theme.colors.accent[600]}) !important; }
        .text-red-500 { color: rgb(${theme.colors.accent[500]}) !important; }
        .text-red-600 { color: rgb(${theme.colors.accent[600]}) !important; }
        .text-red-700 { color: rgb(${theme.colors.accent[700]}) !important; }
        .border-red-200 { border-color: rgb(${theme.colors.accent[100]}) !important; }
        .border-red-300 { border-color: rgb(${theme.colors.accent[100]}) !important; }
        .border-red-600 { border-color: rgb(${theme.colors.accent[600]}) !important; }
        .border-red-800 { border-color: rgb(${theme.colors.accent[700]}) !important; }
        
        .bg-yellow-100 { background-color: rgb(${theme.colors.accent[100]}) !important; }
        .bg-yellow-500 { background-color: rgb(${theme.colors.accent[500]}) !important; }
        .text-yellow-600 { color: rgb(${theme.colors.accent[600]}) !important; }
        .text-yellow-400 { color: rgb(${theme.colors.accent[500]}) !important; }
        
        .bg-indigo-500 { background-color: rgb(${theme.colors.primary[500]}) !important; }
        .text-indigo-600 { color: rgb(${theme.colors.primary[600]}) !important; }
        .text-indigo-700 { color: rgb(${theme.colors.primary[700]}) !important; }
        .text-indigo-400 { color: rgb(${theme.colors.primary[500]}) !important; }
        .text-indigo-300 { color: rgb(${theme.colors.primary[100]}) !important; }
        
        /* ===== NEUTRAL/GRAY SYSTEM MAPPINGS ===== */
        .bg-neutral-100 { background-color: rgb(${theme.colors.surface[100]}) !important; }
        .bg-neutral-200 { background-color: rgb(${theme.colors.surface[200]}) !important; }
        .bg-neutral-700 { background-color: rgb(${theme.colors.surface[700]}) !important; }
        .bg-neutral-800 { background-color: rgb(${theme.colors.surface[800]}) !important; }
        
        .text-neutral-500 { color: rgb(${theme.colors.surface[700]}) !important; }
        .text-neutral-600 { color: rgb(${theme.colors.surface[700]}) !important; }
        .text-neutral-700 { color: rgb(${theme.colors.surface[700]}) !important; }
        .text-neutral-800 { color: rgb(${theme.colors.surface[800]}) !important; }
        
        .bg-gray-100 { background-color: rgb(${theme.colors.surface[100]}) !important; }
        .bg-gray-200 { background-color: rgb(${theme.colors.surface[200]}) !important; }
        .bg-gray-300 { background-color: rgb(${theme.colors.surface[200]}) !important; }
        .bg-gray-700 { background-color: rgb(${theme.colors.surface[700]}) !important; }
        .bg-gray-800 { background-color: rgb(${theme.colors.surface[800]}) !important; }
        .bg-gray-900 { background-color: rgb(${theme.colors.surface[900]}) !important; }
        
        .text-gray-400 { color: rgb(${theme.colors.surface[200]}) !important; }
        .text-gray-500 { color: rgb(${theme.colors.surface[700]}) !important; }
        .text-gray-600 { color: rgb(${theme.colors.surface[700]}) !important; }
        .text-gray-700 { color: rgb(${theme.colors.surface[700]}) !important; }
        .text-gray-800 { color: rgb(${theme.colors.surface[800]}) !important; }
        .text-gray-900 { color: rgb(${theme.colors.surface[900]}) !important; }
        
        .border-gray-200 { border-color: rgb(${theme.colors.surface[200]}) !important; }
        .border-gray-300 { border-color: rgb(${theme.colors.surface[200]}) !important; }
        .border-gray-600 { border-color: rgb(${theme.colors.surface[700]}) !important; }
        .border-gray-700 { border-color: rgb(${theme.colors.surface[700]}) !important; }
        
        /* ===== HOVER STATES FOR NEW COLORS ===== */
        .hover\\:bg-red-100:hover { background-color: rgb(${theme.colors.accent[100]}) !important; }
        .hover\\:bg-red-200:hover { background-color: rgb(${theme.colors.accent[100]}) !important; }
        .hover\\:bg-red-500:hover { background-color: rgb(${theme.colors.accent[500]}) !important; }
        .hover\\:bg-red-600:hover { background-color: rgb(${theme.colors.accent[600]}) !important; }
        .hover\\:bg-red-50:hover { background-color: rgb(${theme.colors.accent[50]}) !important; }
        
        .hover\\:bg-neutral-100:hover { background-color: rgb(${theme.colors.surface[100]}) !important; }
        .hover\\:bg-neutral-200:hover { background-color: rgb(${theme.colors.surface[200]}) !important; }
        .hover\\:bg-neutral-700:hover { background-color: rgb(${theme.colors.surface[700]}) !important; }
        
        .hover\\:text-red-700:hover { color: rgb(${theme.colors.accent[700]}) !important; }
        .hover\\:text-red-300:hover { color: rgb(${theme.colors.accent[100]}) !important; }
        .hover\\:text-neutral-800:hover { color: rgb(${theme.colors.surface[800]}) !important; }
        
        /* ===== DARK MODE FOR NEW COLORS ===== */
        .dark .dark\\:bg-red-900\\/30 { background-color: rgb(${theme.colors.accent[700]} / 0.3) !important; }
        .dark .dark\\:bg-red-900\\/20 { background-color: rgb(${theme.colors.accent[700]} / 0.2) !important; }
        .dark .dark\\:bg-red-900\\/50 { background-color: rgb(${theme.colors.accent[700]} / 0.5) !important; }
        .dark .dark\\:bg-yellow-900\\/30 { background-color: rgb(${theme.colors.accent[700]} / 0.3) !important; }
        
        .dark .dark\\:bg-neutral-700 { background-color: rgb(${theme.colors.surface[700]}) !important; }
        .dark .dark\\:bg-neutral-800 { background-color: rgb(${theme.colors.surface[800]}) !important; }
        
        /* ===== DARK MODE WHITE BACKGROUND OVERRIDES ===== */
        .dark .dark\\:bg-surface-800\\/95 { background-color: rgb(${theme.colors.surface[800]} / 0.95) !important; }
        .dark .dark\\:bg-surface-800\\/70 { background-color: rgb(${theme.colors.surface[800]} / 0.7) !important; }
        .dark .dark\\:bg-surface-700 { background-color: rgb(${theme.colors.surface[700]}) !important; }
        
        .dark .dark\\:text-red-400 { color: rgb(${theme.colors.accent[500]}) !important; }
        .dark .dark\\:text-red-300 { color: rgb(${theme.colors.accent[100]}) !important; }
        .dark .dark\\:text-yellow-400 { color: rgb(${theme.colors.accent[500]}) !important; }
        .dark .dark\\:text-indigo-400 { color: rgb(${theme.colors.primary[500]}) !important; }
        .dark .dark\\:text-indigo-300 { color: rgb(${theme.colors.primary[100]}) !important; }
        
        .dark .dark\\:border-red-800 { border-color: rgb(${theme.colors.accent[700]}) !important; }
        
        .dark .dark\\:hover\\:bg-red-900\\/30:hover { background-color: rgb(${theme.colors.accent[700]} / 0.3) !important; }
        .dark .dark\\:hover\\:bg-neutral-700:hover { background-color: rgb(${theme.colors.surface[700]}) !important; }
        .dark .dark\\:hover\\:text-red-300:hover { color: rgb(${theme.colors.accent[100]}) !important; }
        .dark .dark\\:hover\\:text-indigo-300:hover { color: rgb(${theme.colors.primary[100]}) !important; }
        
        /* ===== SPECIAL CLASSES ===== */
        .peer-checked\\:bg-blue-600 { background-color: rgb(${theme.colors.primary[600]}) !important; }
        .peer-checked\\:bg-primary-600 { background-color: rgb(${theme.colors.primary[600]}) !important; }
        
        /* ===== MORE COLOR MAPPINGS ===== */
        .bg-emerald-100 { background-color: rgb(${theme.colors.primary[100]}) !important; }
        .bg-emerald-600 { background-color: rgb(${theme.colors.primary[600]}) !important; }
        .text-emerald-700 { color: rgb(${theme.colors.primary[700]}) !important; }
        .text-emerald-300 { color: rgb(${theme.colors.primary[100]}) !important; }
        .hover\\:bg-emerald-500:hover { background-color: rgb(${theme.colors.primary[500]}) !important; }
        
        .bg-teal-100 { background-color: rgb(${theme.colors.primary[100]}) !important; }
        .bg-teal-500 { background-color: rgb(${theme.colors.primary[500]}) !important; }
        .text-teal-600 { color: rgb(${theme.colors.primary[600]}) !important; }
        
        .bg-cyan-100 { background-color: rgb(${theme.colors.primary[100]}) !important; }
        .bg-cyan-500 { background-color: rgb(${theme.colors.primary[500]}) !important; }
        .text-cyan-600 { color: rgb(${theme.colors.primary[600]}) !important; }
        
        .bg-sky-100 { background-color: rgb(${theme.colors.primary[100]}) !important; }
        .bg-sky-500 { background-color: rgb(${theme.colors.primary[500]}) !important; }
        .text-sky-600 { color: rgb(${theme.colors.primary[600]}) !important; }
        
        .bg-violet-100 { background-color: rgb(${theme.colors.accent[100]}) !important; }
        .bg-violet-500 { background-color: rgb(${theme.colors.accent[500]}) !important; }
        .text-violet-600 { color: rgb(${theme.colors.accent[600]}) !important; }
        
        .bg-pink-100 { background-color: rgb(${theme.colors.accent[100]}) !important; }
        .bg-pink-500 { background-color: rgb(${theme.colors.accent[500]}) !important; }
        .text-pink-600 { color: rgb(${theme.colors.accent[600]}) !important; }
        
        .bg-rose-100 { background-color: rgb(${theme.colors.accent[100]}) !important; }
        .bg-rose-500 { background-color: rgb(${theme.colors.accent[500]}) !important; }
        .text-rose-600 { color: rgb(${theme.colors.accent[600]}) !important; }
        
        .bg-fuchsia-100 { background-color: rgb(${theme.colors.accent[100]}) !important; }
        .bg-fuchsia-500 { background-color: rgb(${theme.colors.accent[500]}) !important; }
        .text-fuchsia-600 { color: rgb(${theme.colors.accent[600]}) !important; }
        
        /* ===== ZINC/STONE MAPPINGS ===== */
        .bg-zinc-100 { background-color: rgb(${theme.colors.surface[100]}) !important; }
        .bg-zinc-200 { background-color: rgb(${theme.colors.surface[200]}) !important; }
        .bg-zinc-700 { background-color: rgb(${theme.colors.surface[700]}) !important; }
        .bg-zinc-800 { background-color: rgb(${theme.colors.surface[800]}) !important; }
        .text-zinc-500 { color: rgb(${theme.colors.surface[700]}) !important; }
        .text-zinc-600 { color: rgb(${theme.colors.surface[700]}) !important; }
        
        .bg-stone-100 { background-color: rgb(${theme.colors.surface[100]}) !important; }
        .bg-stone-200 { background-color: rgb(${theme.colors.surface[200]}) !important; }
        .bg-stone-700 { background-color: rgb(${theme.colors.surface[700]}) !important; }
        .text-stone-500 { color: rgb(${theme.colors.surface[700]}) !important; }
        
        /* ===== DARK MODE FOR EMERALD/TEAL/CYAN ===== */
        .dark .dark\\:bg-emerald-900\\/40 { background-color: rgb(${theme.colors.primary[700]} / 0.4) !important; }
        .dark .dark\\:text-emerald-300 { color: rgb(${theme.colors.primary[100]}) !important; }
        
        /* ===== OPACITY VARIANTS ===== */
        .bg-red-500\\/90 { background-color: rgb(${theme.colors.accent[500]} / 0.9) !important; }
        .shadow-emerald-500\\/25 { box-shadow: 0 10px 15px -3px rgb(${theme.colors.primary[500]} / 0.25) !important; }
        
        /* ===== TEXT SIZES AND SPECIAL VARIANTS ===== */
        .text-\\[12px\\] { font-size: 12px !important; }
        
           /* ===== FORM ELEMENTS ===== */
           select { 
             background-color: rgb(${theme.colors.surface[50]}) !important; 
             color: rgb(${theme.colors.surface[900]}) !important; 
             border-radius: 12px !important;
           }
           input[type="text"], input[type="number"] { 
             background-color: rgb(${theme.colors.surface[50]}) !important; 
             color: rgb(${theme.colors.surface[900]}) !important; 
             border-radius: 12px !important;
           }
           .dark select { 
             background-color: rgb(${theme.colors.surface[700]}) !important; 
             color: rgb(${theme.colors.surface[100]}) !important; 
           }
           .dark input[type="text"], .dark input[type="number"] { 
             background-color: rgb(${theme.colors.surface[700]}) !important; 
             color: rgb(${theme.colors.surface[100]}) !important; 
           }
           
           /* ===== DROPDOWN OPTIONS STYLING ===== */
           select option {
             padding: 10px 16px !important;
             margin: 2px 4px !important;
             border-radius: 8px !important;
             background-color: rgb(${theme.colors.surface[50]}) !important;
             color: rgb(${theme.colors.surface[900]}) !important;
             border: none !important;
           }
           select option:hover {
             background-color: rgb(${theme.colors.primary[50]}) !important;
             color: rgb(${theme.colors.primary[700]}) !important;
           }
           select option:checked, select option:selected {
             background-color: rgb(${theme.colors.primary[500]}) !important;
             color: white !important;
             font-weight: 500 !important;
           }
           .dark select option {
             background-color: rgb(${theme.colors.surface[700]}) !important;
             color: rgb(${theme.colors.surface[100]}) !important;
           }
           .dark select option:hover {
             background-color: rgb(${theme.colors.surface[600]}) !important;
             color: rgb(${theme.colors.surface[50]}) !important;
           }
           .dark select option:checked, .dark select option:selected {
             background-color: rgb(${theme.colors.primary[500]}) !important;
             color: white !important;
           }
        
        /* ===== ENHANCED DARK MODE CARD FIXES ===== */
        .dark .bg-white { background-color: rgb(${theme.colors.surface[800]}) !important; }
        .dark .bg-white\\/70 { background-color: rgb(${theme.colors.surface[800]} / 0.7) !important; }
        .dark .bg-white\\/95 { background-color: rgb(${theme.colors.surface[800]} / 0.95) !important; }
        
        /* ===== CARD AND PANEL BACKGROUNDS ===== */
        .dark div[class*="bg-white"] { background-color: rgb(${theme.colors.surface[800]}) !important; }
        .dark div[class*="rounded-2xl"] { background-color: rgb(${theme.colors.surface[800]} / 0.7) !important; }
        .dark div[class*="rounded-xl"] { background-color: rgb(${theme.colors.surface[800]}) !important; }
        .dark div[class*="shadow-xl"] { background-color: rgb(${theme.colors.surface[800]}) !important; }
        
        /* ===== MODAL AND DIALOG BACKGROUNDS ===== */
        .dark div[class*="fixed"][class*="z-"] { background-color: rgb(${theme.colors.surface[800]}) !important; }
        .dark div[class*="max-w-md"] { background-color: rgb(${theme.colors.surface[800]}) !important; }
        
        /* ===== UNIVERSAL OVERRIDES FOR MISSED ELEMENTS ===== */
        div[class*="bg-white"] { background-color: rgb(${theme.colors.surface[50]}) !important; }
        div[class*="border-r"] { background-color: rgb(${theme.colors.surface[50]}) !important; }
        div[class*="border-l"] { background-color: rgb(${theme.colors.surface[50]}) !important; }
        .dark div[class*="border-r"] { background-color: rgb(${theme.colors.surface[800]}) !important; }
        .dark div[class*="border-l"] { background-color: rgb(${theme.colors.surface[800]}) !important; }
        
        /* ===== TEXT COLOR FIXES FOR DARK MODE ===== */
        .dark .text-surface-900 { color: rgb(${theme.colors.surface[100]}) !important; }
        .dark select, .dark input[type="text"], .dark input[type="number"] { 
          background-color: rgb(${theme.colors.surface[700]}) !important; 
          color: rgb(${theme.colors.surface[100]}) !important; 
        }
        .dark textarea { 
          background-color: rgb(${theme.colors.surface[700]}) !important; 
          color: rgb(${theme.colors.surface[100]}) !important; 
        }
        
        /* ===== FOCUS STATES ===== */
        .focus\\:border-red-500:focus { border-color: rgb(${theme.colors.accent[500]}) !important; }
      `;
      
      styleSheet.textContent = css;
      console.log('Dynamic theme styles applied - Total styles:', css.split('\n').length - 1);
      
      // 强制重新渲染所有元素
      document.body.style.display = 'none';
      document.body.offsetHeight; // trigger reflow
      document.body.style.display = 'block';
    },
    
    toggleDarkMode() {
      this.isDarkMode = !this.isDarkMode;
      
      // 明确地添加或移除dark类
      if (this.isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      console.log('Dark mode toggled:', this.isDarkMode);
      // 延迟保存，避免并发问题
      setTimeout(() => this.saveToSettings(), 100);
    },
    
    addCustomTheme(theme: ThemeConfig) {
      // 检查是否已存在相同ID的主题
      const existingIndex = this.customThemes.findIndex((t: ThemeConfig) => t.id === theme.id);
      if (existingIndex >= 0) {
        this.customThemes[existingIndex] = theme;
      } else {
        this.customThemes.push(theme);
      }
      setTimeout(() => this.saveToSettings(), 100);
    },
    
    removeCustomTheme(themeId: string) {
      this.customThemes = this.customThemes.filter((t: ThemeConfig) => t.id !== themeId);
      
      // 如果删除的是当前主题，切换到默认主题
      if (this.currentTheme === themeId) {
        this.setTheme('default');
      }
      
      setTimeout(() => this.saveToSettings(), 100);
    },
    
    importTheme(themeData: string | ThemeConfig): boolean {
      try {
        let theme: ThemeConfig;
        
        if (typeof themeData === 'string') {
          theme = JSON.parse(themeData);
        } else {
          theme = themeData;
        }
        
        // 验证主题数据结构
        if (!this.validateTheme(theme)) {
          throw new Error('Invalid theme format');
        }
        
        this.addCustomTheme(theme);
        return true;
      } catch (error) {
        console.error('Failed to import theme:', error);
        return false;
      }
    },
    
    exportTheme(themeId: string): string | null {
      const theme = this.allThemes.find((t: ThemeConfig) => t.id === themeId);
      if (!theme) return null;
      
      return JSON.stringify(theme, null, 2);
    },
    
    validateTheme(theme: any): theme is ThemeConfig {
      return (
        theme &&
        typeof theme.id === 'string' &&
        typeof theme.name === 'string' &&
        theme.colors &&
        theme.colors.primary &&
        theme.colors.accent &&
        theme.colors.surface
      );
    },
    
    async loadFromSettings() {
      console.log('🎨 Theme store: Loading theme from settings');
      try {
        console.log('📡 Theme store: Invoking settings:get IPC');
        const settings = await window.mn.ipc.invoke('settings:get');
        console.log('📦 Theme store: Received settings:', settings);
        if (settings.theme) {
          console.log('🎨 Theme store: Found theme settings:', settings.theme);
          this.currentTheme = settings.theme.current || 'default';
          
          // 安全地处理暗色模式设置
          const savedDarkMode = settings.theme.darkMode;
          this.isDarkMode = savedDarkMode === true; // 明确检查是否为true
          
          // 加载系统主题检测设置
          this.systemThemeDetection = settings.theme.systemThemeDetection !== false; // 默认启用
          
          // 确保自定义主题是纯对象数组
          this.customThemes = Array.isArray(settings.theme.customThemes) 
            ? JSON.parse(JSON.stringify(settings.theme.customThemes))
            : [];
          
          // 只在首次加载时应用主题
          const isFirstLoad = !document.body.hasAttribute('data-theme-loaded');
          if (isFirstLoad) {
            const theme = this.activeTheme;
            if (theme) {
              this.applyTheme(theme);
            }
            
            // 明确设置暗色模式类
            if (this.isDarkMode) {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
            
            document.body.setAttribute('data-theme-loaded', 'true');
          }
          console.log('Theme settings loaded successfully:', this.currentTheme, 'Dark mode:', this.isDarkMode);
        }
      } catch (error) {
        console.error('Failed to load theme settings:', error);
      }
    },
    
    async saveToSettings() {
      try {
        // 创建一个可序列化的普通对象，去除Vue的响应式代理
        const themeSettings = {
          current: this.currentTheme,
          darkMode: this.isDarkMode,
          systemThemeDetection: this.systemThemeDetection,
          customThemes: JSON.parse(JSON.stringify(this.customThemes)), // 深度克隆去除响应式
        };
        
        await window.mn.ipc.invoke('settings:set', {
          theme: themeSettings
        });
        console.log('Theme settings saved successfully');
      } catch (error) {
        console.error('Failed to save theme settings:', error);
      }
    },
    
    initTheme() {
      console.log('🎨 Theme store: Starting theme initialization');
      // 检查是否已经初始化过
      const alreadyInitialized = document.body.hasAttribute('data-theme-initialized');
      if (alreadyInitialized) {
        console.log('🔄 Theme store: Theme already initialized, skipping...');
        return;
      }
      
      // 检测系统主题偏好
      if (this.systemThemeDetection) {
        this.detectSystemTheme();
      } else {
        // 确保暗色模式状态正确
        this.isDarkMode = false;
        document.documentElement.classList.remove('dark');
      }
      
      // 初始化时应用默认主题
      const theme = this.activeTheme;
      if (theme) {
        this.applyTheme(theme);
        console.log('Theme initialized:', theme.name);
      }
      
      console.log('Dark mode initialized as:', this.isDarkMode);
      
      // 标记已初始化
      document.body.setAttribute('data-theme-initialized', 'true');
    },
    
    detectSystemTheme() {
      // 检测系统是否偏好深色模式
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.isDarkMode = prefersDark;
      
      if (this.isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      console.log('System theme detected:', prefersDark ? 'dark' : 'light');
      
      // 监听系统主题变化
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (this.systemThemeDetection) {
          this.isDarkMode = e.matches;
          if (this.isDarkMode) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          console.log('System theme changed to:', e.matches ? 'dark' : 'light');
          this.saveToSettings();
        }
      });
    }
  },
});
