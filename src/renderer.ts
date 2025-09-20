/**
 * This file will automatically be loaded by vite and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/process-model
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.ts` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './ui/App.vue';
import i18n from './i18n';
import './styles/tailwind.css';
import { useSettingsStore } from './stores/settings';
import { useSessionStore } from './stores/session';
import { useEditorStore } from './stores/editor';
import { useTabGroupsStore } from './stores/tabgroups';

const app = createApp(App);
app.use(createPinia());
app.use(i18n);
app.mount('#app');

// reactive i18n by settings
const settings = useSettingsStore();
settings.$subscribe((_m, state) => {
  if (state.data) {
    i18n.global.locale.value = state.data.language;
    const html = document.documentElement;
    html.classList.toggle('dark', state.data.theme === 'dark' || (state.data.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches));
  }
});

// restore session
const session = useSessionStore();
session.restore();

// autosave session on unload
window.addEventListener('beforeunload', () => {
  session.save();
});

// Ctrl+S to save
window.addEventListener('keydown', (e) => {
  const isCtrlS = (e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S');
  if (isCtrlS) {
    e.preventDefault();
    const ed = useEditorStore();
    ed.saveActive();
  }
});

// session autosave timer
setInterval(() => {
  session.save();
}, 5000);

// workspace change policy: clear session if configured
let prevWorkspace: string | null = null;
settings.$subscribe((_m, state) => {
  const ws = state.data?.workspacePath || null;
  if (prevWorkspace && ws && prevWorkspace !== ws) {
    const keep = !!state.data?.session?.keepOnWorkspaceChange;
    if (!keep) {
      const tg = useTabGroupsStore();
      tg.reset();
      session.save();
    }
  }
  prevWorkspace = ws;
});
