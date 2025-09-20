import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import fs from 'node:fs';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Database = require('better-sqlite3');
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  console.log('⏹️ Squirrel startup detected, quitting...');
  app.quit();
}

const getInstallDir = () => {
  try {
    const exePath = app.getPath('exe');
    return path.dirname(exePath);
  } catch {
    return process.cwd();
  }
};

const ensureDefaultDirs = (baseDir: string) => {
  const workspace = path.join(baseDir, 'workerspace');
  const plugins = path.join(baseDir, '.memorynote');
  const config = path.join(baseDir, 'config');
  for (const dir of [workspace, plugins, config]) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }
  const settingsPath = path.join(config, 'settings.json');
  if (!fs.existsSync(settingsPath)) {
    const defaults = {
      workspacePath: workspace,
      language: 'zh-CN',
      theme: {
        current: 'default',
        darkMode: false,
        systemThemeDetection: true,
        customThemes: []
      },
      editor: { 
        fontSize: 14, 
        lineHeight: 1.6, 
        autosave: 'off',
        // 编辑器行为默认值
        wordWrap: true,
        showLineNumbers: false,
        syntaxHighlight: true,
        // 预览控制默认值
        showPreview: false
      },
      search: { 
        provider: 'local', 
        topK: 8,
        // 搜索配置默认值
        autoRebuildIndex: true,
        hybridSearch: false,
        similarityThreshold: 0.7
      },
      llm: { provider: 'ollama', baseURL: 'http://127.0.0.1:11434', model: 'qwen2.5:7b', embedModel: 'nomic-embed-text' },
      // 高级设置默认值
      advanced: {
        gpuAcceleration: true,
        preloadFiles: false,
        sandboxPlugins: true,
        autoUpdate: false,
        analytics: false,
        autoIndexing: false,
        aiSuggestions: false,
        collaboration: false,
        memoryCacheSize: 500
      }
    } as const;
    fs.writeFileSync(settingsPath, JSON.stringify(defaults, null, 2), 'utf-8');
  }
  return { workspace, plugins, config, settingsPath };
};

let SETTINGS_PATH: string | null = null;
let CONFIG_DIR: string | null = null;
let PLUGINS_DIR: string | null = null;

const createWindow = () => {
  console.log('🪟 Creating main window...');
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    frame: false,
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    console.log('🌐 Loading dev server URL:', MAIN_WINDOW_VITE_DEV_SERVER_URL);
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    const htmlPath = path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`);
    console.log('📄 Loading HTML file:', htmlPath);
    console.log('📁 __dirname:', __dirname);
    console.log('📋 MAIN_WINDOW_VITE_NAME:', MAIN_WINDOW_VITE_NAME);
    
    // 检查文件是否存在
    if (fs.existsSync(htmlPath)) {
      console.log('✅ HTML file exists, loading...');
      mainWindow.loadFile(htmlPath);
    } else {
      console.error('❌ HTML file not found:', htmlPath);
      // 尝试备用路径
      const fallbackPath = path.join(__dirname, '../renderer/index.html');
      console.log('🔄 Trying fallback path:', fallbackPath);
      if (fs.existsSync(fallbackPath)) {
        console.log('✅ Fallback HTML file exists, loading...');
        mainWindow.loadFile(fallbackPath);
      } else {
        console.error('❌ Fallback HTML file also not found');
        // 最后尝试直接从当前目录
        const currentDirPath = path.join(process.cwd(), 'dist/renderer/index.html');
        console.log('🔄 Trying current directory path:', currentDirPath);
        if (fs.existsSync(currentDirPath)) {
          console.log('✅ Current directory HTML file exists, loading...');
          mainWindow.loadFile(currentDirPath);
        } else {
          console.error('❌ All HTML file paths failed');
        }
      }
    }
  }

  // Open the DevTools.
  if (!app.isPackaged) {
    console.log('🔧 Opening DevTools (development mode)');
    mainWindow.webContents.openDevTools();
  }
  
  // 添加窗口事件监听
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('✅ Main window finished loading');
  });
  
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('❌ Main window failed to load:', errorCode, errorDescription);
  });

  // Window control IPC
  ipcMain.handle('window:minimize', () => {
    const win = BrowserWindow.getFocusedWindow() ?? mainWindow;
    win.minimize();
  });
  ipcMain.handle('window:maximizeOrRestore', () => {
    const win = BrowserWindow.getFocusedWindow() ?? mainWindow;
    if (win.isMaximized()) {
      win.unmaximize();
    } else {
      win.maximize();
    }
    return win.isMaximized();
  });
  ipcMain.handle('window:close', () => {
    const win = BrowserWindow.getFocusedWindow() ?? mainWindow;
    win.close();
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.



// 初始化应用目录和路径
function initializeApp() {
  console.log('🚀 Initializing application...');
  const baseDir = getInstallDir();
  console.log('📁 Install directory:', baseDir);
  
  const { settingsPath, config, plugins } = ensureDefaultDirs(baseDir);
  console.log('📂 Settings path:', settingsPath);
  console.log('📂 Config directory:', config);
  console.log('📂 Plugins directory:', plugins);
  
  SETTINGS_PATH = settingsPath;
  CONFIG_DIR = config;
  PLUGINS_DIR = plugins;
}

// 辅助函数：确保设置路径已初始化
function ensureSettingsPath(): string {
  if (!SETTINGS_PATH) {
    console.log('🔄 Settings path not initialized, initializing...');
    const baseDir = getInstallDir();
    const { settingsPath, config, plugins } = ensureDefaultDirs(baseDir);
    SETTINGS_PATH = settingsPath;
    CONFIG_DIR = config;
    PLUGINS_DIR = plugins;
  }
  return SETTINGS_PATH;
}

// 注册所有 IPC 处理器 - 在应用启动时立即注册
function registerIpcHandlers() {
  console.log('📡 Registering IPC handlers...');

  ipcMain.handle('settings:get', async () => {
    console.log('⚙️ Settings:get request received');
    try {
      const settingsPath = ensureSettingsPath();
      console.log('📖 Reading settings from:', settingsPath);
      const raw = fs.readFileSync(settingsPath, 'utf-8');
      const settings = JSON.parse(raw);
      console.log('✅ Settings loaded successfully:', Object.keys(settings));
      return settings;
    } catch (e) {
      console.warn('❌ Failed to load settings:', e.message);
      console.log('🔄 Returning empty object as fallback');
      return {};
    }
  });
  ipcMain.handle('settings:set', async (_e, partial: Record<string, unknown>) => {
    const settingsPath = ensureSettingsPath();
    const current = fs.existsSync(settingsPath)
      ? JSON.parse(fs.readFileSync(settingsPath, 'utf-8'))
      : {};
    const next = { ...current, ...partial };
    fs.writeFileSync(settingsPath, JSON.stringify(next, null, 2), 'utf-8');
    return next;
    });

  ipcMain.handle('settings:resetToFactory', async () => {
    console.log('🔄 Factory reset requested');
    try {
      const settingsPath = ensureSettingsPath();
      
      // 删除现有设置文件，让应用重新创建默认设置
      if (fs.existsSync(settingsPath)) {
        console.log('🗑️ Deleting existing settings file:', settingsPath);
        fs.unlinkSync(settingsPath);
      }
      
      // 重新初始化目录和默认设置
      console.log('📁 Re-initializing directories');
      const { workspace } = ensureDefaultDirs(getInstallDir());
      console.log('📂 Default workspace:', workspace);
      
      const defaults = {
        workspacePath: workspace,
        language: 'zh-CN',
        theme: {
          current: 'default',
          darkMode: false,
          systemThemeDetection: true,
          customThemes: [] as any[]
        },
        editor: { 
          fontSize: 14, 
          lineHeight: 1.6, 
          autosave: 'off',
          // 编辑器行为默认值
          wordWrap: true,
          showLineNumbers: false,
          syntaxHighlight: true,
          // 预览控制默认值
          showPreview: false
        },
        search: { 
          provider: 'local', 
          topK: 8,
          // 搜索配置默认值
          autoRebuildIndex: true,
          hybridSearch: false,
          similarityThreshold: 0.7
        },
        llm: { provider: 'ollama', baseURL: 'http://127.0.0.1:11434', model: 'qwen2.5:7b', embedModel: 'nomic-embed-text' },
        // 高级设置默认值
        advanced: {
          gpuAcceleration: true,
          preloadFiles: false,
          sandboxPlugins: true,
          autoUpdate: false,
          analytics: false,
          autoIndexing: false,
          aiSuggestions: false,
          collaboration: false,
          memoryCacheSize: 500
        }
      };
      
      // 写入默认设置
      console.log('💾 Writing default settings to file');
      fs.writeFileSync(settingsPath, JSON.stringify(defaults, null, 2), 'utf-8');
      console.log('✅ Factory reset completed successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to reset settings:', error);
      throw error;
    }
  });

  ipcMain.handle('app:restart', async () => {
    console.log('🔄 App restart requested');
    try {
      console.log('📍 Current working directory:', process.cwd());
      console.log('📍 Process execPath:', process.execPath);
      console.log('📍 Process argv:', process.argv);
      console.log('📍 __dirname:', __dirname);
      
      console.log('🚀 Calling app.relaunch()...');
      app.relaunch();
      console.log('✅ app.relaunch() called successfully');
      
      // 延迟一下再退出当前实例，确保新实例有时间启动
      setTimeout(() => {
        console.log('🛑 Exiting current instance after delay');
        app.quit();
      }, 1000);
      
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to restart app:', error);
      throw error;
    }
  });
  
    // Workspace: scan directory tree
  ipcMain.handle('workspace:scan', async () => {
    const settingsPath = ensureSettingsPath();
    const settings = JSON.parse(fs.readFileSync(ensureSettingsPath(), 'utf-8')) as { workspacePath: string };
    const root = settings.workspacePath;
    function readDirRecursive(dir: string): any {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      const nodes = entries
        .filter((e) => !e.name.startsWith('.'))
        .map((e) => {
          const full = path.join(dir, e.name);
          if (e.isDirectory()) {
            return { type: 'dir', name: e.name, path: full, children: readDirRecursive(full) };
          }
          return { type: 'file', name: e.name, path: full };
        });
      nodes.sort((a: any, b: any) => {
        const ad = a.type === 'dir' ? 0 : 1;
        const bd = b.type === 'dir' ? 0 : 1;
        if (ad !== bd) return ad - bd; // dirs first
        return String(a.name).localeCompare(String(b.name), undefined, { sensitivity: 'base' });
      });
      return nodes;
    }
    return { root, tree: readDirRecursive(root) };
  });

  // File read (under workspace only)
  ipcMain.handle('file:read', async (_e, filePath: string) => {
    const settings = JSON.parse(fs.readFileSync(ensureSettingsPath(), 'utf-8')) as { workspacePath: string };
    const root = settings.workspacePath;
    const resolved = path.resolve(filePath);
    if (!resolved.startsWith(path.resolve(root))) {
      throw new Error('Access denied');
    }
    return fs.readFileSync(resolved, 'utf-8');
  });

  // File text read with simple BOM detection and metadata
  ipcMain.handle('file:readText', async (_e, filePath: string) => {
    const settings = JSON.parse(fs.readFileSync(ensureSettingsPath(), 'utf-8')) as { workspacePath: string };
    const root = settings.workspacePath;
    const resolved = path.resolve(filePath);
    if (!resolved.startsWith(path.resolve(root))) {
      throw new Error('Access denied');
    }
    const buf = fs.readFileSync(resolved);
    let encoding: 'utf-8' | 'utf16le' | 'utf16be' = 'utf-8';
    let offset = 0;
    if (buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) {
      encoding = 'utf-8';
      offset = 3;
    } else if (buf.length >= 2 && buf[0] === 0xff && buf[1] === 0xfe) {
      encoding = 'utf16le';
      offset = 2;
    } else if (buf.length >= 2 && buf[0] === 0xfe && buf[1] === 0xff) {
      encoding = 'utf16be';
      offset = 2;
    }
    let text = '';
    if (encoding === 'utf-8') {
      text = buf.toString('utf-8', offset);
    } else if (encoding === 'utf16le') {
      text = buf.toString('utf16le', offset);
    } else {
      // utf16be -> swap bytes then decode as utf16le
      const swapped = Buffer.alloc(buf.length - offset);
      for (let i = offset; i + 1 < buf.length; i += 2) {
        swapped[i - offset] = buf[i + 1];
        swapped[i - offset + 1] = buf[i];
      }
      text = swapped.toString('utf16le');
    }
    const st = fs.statSync(resolved);
    return { type: 'text', content: text, encoding, size: st.size, mtime: st.mtimeMs } as const;
  });

  function guessMime(p: string): string {
    const ext = path.extname(p).toLowerCase();
    switch (ext) {
      case '.png': return 'image/png';
      case '.jpg': case '.jpeg': return 'image/jpeg';
      case '.gif': return 'image/gif';
      case '.svg': return 'image/svg+xml';
      case '.webp': return 'image/webp';
      case '.pdf': return 'application/pdf';
      case '.txt': return 'text/plain; charset=utf-8';
      case '.md': return 'text/markdown; charset=utf-8';
      case '.json': return 'application/json; charset=utf-8';
      default: return 'application/octet-stream';
    }
  }

  // File binary read (base64) with mime
  ipcMain.handle('file:readBinary', async (_e, filePath: string) => {
    const settings = JSON.parse(fs.readFileSync(ensureSettingsPath(), 'utf-8')) as { workspacePath: string };
    const root = settings.workspacePath;
    const resolved = path.resolve(filePath);
    if (!resolved.startsWith(path.resolve(root))) {
      throw new Error('Access denied');
    }
    const buf = fs.readFileSync(resolved);
    const st = fs.statSync(resolved);
    const mime = guessMime(resolved);
    return { type: 'binary', data: buf.toString('base64'), size: st.size, mtime: st.mtimeMs, mime } as const;
  });

  // File range read (base64) for large files
  ipcMain.handle('file:readRange', async (_e, filePath: string, start = 0, length = 1024 * 256) => {
    const settings = JSON.parse(fs.readFileSync(ensureSettingsPath(), 'utf-8')) as { workspacePath: string };
    const root = settings.workspacePath;
    const resolved = path.resolve(filePath);
    if (!resolved.startsWith(path.resolve(root))) {
      throw new Error('Access denied');
    }
    const st = fs.statSync(resolved);
    const fd = fs.openSync(resolved, 'r');
    try {
      const end = Math.min(start + length, st.size);
      const buf = Buffer.alloc(Math.max(0, end - start));
      fs.readSync(fd, buf, 0, buf.length, start);
      const mime = guessMime(resolved);
      return { data: buf.toString('base64'), start, end, size: st.size, mime } as const;
    } finally {
      fs.closeSync(fd);
    }
  });

  // File stat
  ipcMain.handle('file:stat', async (_e, filePath: string) => {
    const settings = JSON.parse(fs.readFileSync(ensureSettingsPath(), 'utf-8')) as { workspacePath: string };
    const root = settings.workspacePath;
    const resolved = path.resolve(filePath);
    if (!resolved.startsWith(path.resolve(root))) {
      throw new Error('Access denied');
    }
    const st = fs.statSync(resolved);
    return {
      path: resolved,
      isDirectory: st.isDirectory(),
      size: st.size,
      mtime: st.mtimeMs,
      ctime: st.ctimeMs,
      ext: path.extname(resolved).toLowerCase(),
      mime: guessMime(resolved),
    } as const;
  });

  // File write (under workspace only)
  ipcMain.handle('file:write', async (_e, filePath: string, content: string) => {
    const settings = JSON.parse(fs.readFileSync(ensureSettingsPath(), 'utf-8')) as { workspacePath: string };
    const root = settings.workspacePath;
    const resolved = path.resolve(filePath);
    if (!resolved.startsWith(path.resolve(root))) {
      throw new Error('Access denied');
    }
    fs.mkdirSync(path.dirname(resolved), { recursive: true });
    fs.writeFileSync(resolved, content, 'utf-8');
    return { ok: true } as const;
  });

  // Snapshot write to .cache/autosaveSnapshots
  ipcMain.handle('file:snapshot', async (_e, filePath: string, content: string) => {
    const settings = JSON.parse(fs.readFileSync(ensureSettingsPath(), 'utf-8')) as { workspacePath: string };
    const root = settings.workspacePath;
    const resolved = path.resolve(filePath);
    if (!resolved.startsWith(path.resolve(root))) {
      throw new Error('Access denied');
    }
    const cacheDir = path.join(root, '.cache', 'autosaveSnapshots');
    fs.mkdirSync(cacheDir, { recursive: true });
    const safeName = resolved.replace(/[:\\/]/g, '_');
    const snapPath = path.join(cacheDir, safeName + '.snap');
    fs.writeFileSync(snapPath, content, 'utf-8');
    return { ok: true } as const;
  });

  // Simple fulltext search
  ipcMain.handle('search:fulltext', async (_e, query: string, limit = 100) => {
    const settings = JSON.parse(fs.readFileSync(ensureSettingsPath(), 'utf-8')) as { workspacePath: string };
    const root = settings.workspacePath;
    const results: Array<{ file: string; line: number; preview: string }> = [];
    const exts = new Set(['.md', '.txt', '.json']);
    function walk(dir: string) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const e of entries) {
        if (e.name.startsWith('.')) continue;
        const full = path.join(dir, e.name);
        if (e.isDirectory()) {
          walk(full);
        } else if (exts.has(path.extname(e.name).toLowerCase())) {
          try {
            const text = fs.readFileSync(full, 'utf-8');
            const lines = text.split(/\r?\n/);
            for (let i = 0; i < lines.length; i++) {
              if (lines[i].toLowerCase().includes(query.toLowerCase())) {
                results.push({ file: full, line: i + 1, preview: lines[i].trim().slice(0, 200) });
                if (results.length >= limit) return;
              }
            }
          } catch {}
        }
        if (results.length >= limit) return;
      }
    }
    walk(root);
    return results;
  });

  // --- Semantic Index & RAG ---
  async function getLLMSettings() {
    try {
      const j = JSON.parse(fs.readFileSync(ensureSettingsPath(), 'utf-8'));
      return j.llm || {};
    } catch { return {}; }
  }
  function getIndexDir(root: string) {
    const dir = path.join(root, '.index');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    return dir;
  }
  function chunkText(text: string): string[] {
    const paras = text.split(/\n\s*\n/);
    const chunks: string[] = [];
    let buf = '';
    for (const p of paras) {
      if ((buf + '\n' + p).length > 800) {
        if (buf) chunks.push(buf.trim());
        buf = p;
      } else {
        buf = buf ? buf + '\n' + p : p;
      }
    }
    if (buf.trim()) chunks.push(buf.trim());
    return chunks.filter(c => c.length > 0);
  }
  async function embedAll(texts: string[], baseURL: string, model: string): Promise<number[][]> {
    const out: number[][] = [];
    for (const t of texts) {
      try {
        const res = await fetch(`${baseURL.replace(/\/$/, '')}/api/embeddings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model, input: t }),
        });
        const j = await res.json();
        const vec = j?.embedding || j?.data?.[0]?.embedding;
        if (Array.isArray(vec)) out.push(vec as number[]); else out.push([]);
      } catch {
        out.push([]);
      }
    }
    return out;
  }
  function cosine(a: number[], b: number[]): number {
    if (!a?.length || !b?.length || a.length !== b.length) return -1;
    let dot = 0, na = 0, nb = 0;
    for (let i = 0; i < a.length; i++) { dot += a[i]*b[i]; na += a[i]*a[i]; nb += b[i]*b[i]; }
    if (!na || !nb) return -1;
    return dot / (Math.sqrt(na) * Math.sqrt(nb));
  }

  ipcMain.handle('index:rebuild', async () => {
    const settings = JSON.parse(fs.readFileSync(ensureSettingsPath(), 'utf-8')) as { workspacePath: string, llm?: any };
    const root = settings.workspacePath;
    const indexDir = getIndexDir(root);
    const semanticPath = path.join(indexDir, 'semantic.json');
    const exts = new Set(['.md', '.txt']);
    const files: string[] = [];
    (function walk(dir: string) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const e of entries) {
        if (e.name.startsWith('.')) continue;
        const full = path.join(dir, e.name);
        if (e.isDirectory()) walk(full); else if (exts.has(path.extname(e.name).toLowerCase())) files.push(full);
      }
    })(root);

    const llm = await getLLMSettings();
    const baseURL = llm.baseURL || 'http://127.0.0.1:11434';
    const model = llm.model || 'mxbai-embed-large';

    const entries: any[] = [];
    for (const file of files) {
      try {
        const text = fs.readFileSync(file, 'utf-8');
        const chunks = chunkText(text);
        const embs = await embedAll(chunks, baseURL, model);
        for (let i = 0; i < chunks.length; i++) {
          entries.push({ id: `${file}#${i}`, file, text: chunks[i], embedding: embs[i] || [] });
        }
      } catch {}
    }
    fs.writeFileSync(semanticPath, JSON.stringify({ entries }, null, 2), 'utf-8');
    return { files: files.length, chunks: entries.length };
  });

  // Workspace stats: counts and recent files
  ipcMain.handle('workspace:stats', async () => {
    const settings = JSON.parse(fs.readFileSync(ensureSettingsPath(), 'utf-8')) as { workspacePath: string };
    const root = settings.workspacePath;
    const exts = new Set(['.md', '.txt', '.json', '.png', '.jpg', '.jpeg']);
    let files = 0, dirs = 0;
    const recent: Array<{ file: string; mtime: number }> = [];
    (function walk(dir: string) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const e of entries) {
        if (e.name.startsWith('.')) continue;
        const full = path.join(dir, e.name);
        if (e.isDirectory()) {
          dirs++; walk(full);
        } else {
          files++;
          if (exts.has(path.extname(e.name).toLowerCase())) {
            try {
              const st = fs.statSync(full);
              recent.push({ file: full, mtime: st.mtimeMs });
            } catch {}
          }
        }
      }
    })(root);
    recent.sort((a,b) => b.mtime - a.mtime);
    return { files, dirs, recent: recent.slice(0, 12) };
  });

  ipcMain.handle('search:semantic', async (_e, query: string, topK = 8) => {
    const settings = JSON.parse(fs.readFileSync(ensureSettingsPath(), 'utf-8')) as { workspacePath: string, llm?: any };
    const root = settings.workspacePath;
    const indexDir = getIndexDir(root);
    const semanticPath = path.join(indexDir, 'semantic.json');
    if (!fs.existsSync(semanticPath)) return [];
    const data = JSON.parse(fs.readFileSync(semanticPath, 'utf-8')) as { entries: any[] };
    const llm = await getLLMSettings();
    const baseURL = llm.baseURL || 'http://127.0.0.1:11434';
    const model = llm.model || 'mxbai-embed-large';
    const [qvec] = await embedAll([query], baseURL, model);
    const scored = data.entries.map((e) => ({ ...e, score: cosine(qvec, e.embedding) })).sort((a,b) => b.score - a.score).slice(0, topK);
    return scored.map(({ id, file, text, score }) => ({ id, file, text, score }));
  });

  ipcMain.handle('rag:ask', async (_e, question: string, topK = 6) => {
    const contexts = await (await ipcMain.handle as any)('search:semantic', null, question, topK);
    const llm = await getLLMSettings();
    const baseURL = llm.baseURL || 'http://127.0.0.1:11434';
    const model = llm.model || 'llama3.1:8b';
    const prompt = `You are a helpful assistant. Use ONLY the provided context to answer. If the context does not contain the answer, say you don't know.\n\nQuestion: ${question}\n\nContext:\n${contexts.map((c: any, i: number) => `[${i+1}] (${c.file}) ${c.text}`).join('\n---\n')}\n\nAnswer:`;
    try {
      const res = await fetch(`${baseURL.replace(/\/$/, '')}/api/generate`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model, prompt, stream: false })
      });
      const j = await res.json();
      const answer = j?.response || '';
      return { answer, contexts };
    } catch {
      return { answer: 'LLM unavailable. Please check settings.', contexts };
    }
  });

  // Plugins: scan manifests in .memorynote
  ipcMain.handle('plugins:scan', async () => {
    const enabled = (() => {
      try {
        const raw = fs.readFileSync(ensureSettingsPath(), 'utf-8');
        const j = JSON.parse(raw);
        return Array.isArray(j.enabledPlugins) ? j.enabledPlugins : [];
      } catch { return []; }
    })();
    const dir = PLUGINS_DIR!;
    if (!fs.existsSync(dir)) return [] as any[];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const list: any[] = [];
    for (const e of entries) {
      if (!e.isDirectory()) continue;
      const pdir = path.join(dir, e.name);
      const manifestPath = path.join(pdir, 'manifest.json');
      if (!fs.existsSync(manifestPath)) continue;
      try {
        const m = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
        list.push({
          id: m.id || e.name,
          name: m.name || e.name,
          version: m.version || '0.0.0',
          description: m.description || '',
          mountPoints: m.mountPoints || {},
          enabled: enabled.includes(m.id || e.name),
        });
      } catch {}
    }
    return list;
  });
  ipcMain.handle('plugins:toggle', async (_e, id: string, enable: boolean) => {
    const settingsPath = ensureSettingsPath();
    const current = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
    const list: string[] = Array.isArray(current.enabledPlugins) ? current.enabledPlugins : [];
    const set = new Set(list);
    if (enable) set.add(id); else set.delete(id);
    current.enabledPlugins = Array.from(set);
    fs.writeFileSync(settingsPath, JSON.stringify(current, null, 2), 'utf-8');
    return current.enabledPlugins;
  });

  // Session persistence
  ipcMain.handle('session:get', async () => {
    ensureSettingsPath(); // 确保路径初始化
    const sessionPath = path.join(CONFIG_DIR!, 'session.json');
    if (!fs.existsSync(sessionPath)) return null;
    try { return JSON.parse(fs.readFileSync(sessionPath, 'utf-8')); } catch { return null; }
  });
  ipcMain.handle('session:set', async (_e, data: any) => {
    ensureSettingsPath(); // 确保路径初始化
    const sessionPath = path.join(CONFIG_DIR!, 'session.json');
    fs.writeFileSync(sessionPath, JSON.stringify(data, null, 2), 'utf-8');
    return { ok: true } as const;
  });

  // Dialogs
  ipcMain.handle('dialog:chooseDirectory', async () => {
    const res = await dialog.showOpenDialog({ properties: ['openDirectory'] });
    if (res.canceled || !res.filePaths.length) return null;
    return res.filePaths[0];
  });

  // File operations
  ipcMain.handle('file:create', async (_e, filePath: string, isDirectory = false) => {
    const settings = JSON.parse(fs.readFileSync(ensureSettingsPath(), 'utf-8')) as { workspacePath: string };
    const root = settings.workspacePath;
    const resolved = path.resolve(filePath);
    if (!resolved.startsWith(path.resolve(root))) throw new Error('Access denied');
    if (isDirectory) {
      fs.mkdirSync(resolved, { recursive: true });
    } else {
      fs.mkdirSync(path.dirname(resolved), { recursive: true });
      fs.writeFileSync(resolved, '', 'utf-8');
    }
    return { ok: true };
  });
  ipcMain.handle('file:rename', async (_e, oldPath: string, newPath: string) => {
    const settings = JSON.parse(fs.readFileSync(ensureSettingsPath(), 'utf-8')) as { workspacePath: string };
    const root = settings.workspacePath;
    const oldResolved = path.resolve(oldPath);
    const newResolved = path.resolve(newPath);
    if (!oldResolved.startsWith(path.resolve(root)) || !newResolved.startsWith(path.resolve(root))) {
      throw new Error('Access denied');
    }
    fs.renameSync(oldResolved, newResolved);
    return { ok: true };
  });
  ipcMain.handle('file:delete', async (_e, filePath: string) => {
    const settings = JSON.parse(fs.readFileSync(ensureSettingsPath(), 'utf-8')) as { workspacePath: string };
    const root = settings.workspacePath;
    const resolved = path.resolve(filePath);
    if (!resolved.startsWith(path.resolve(root))) throw new Error('Access denied');
    const stat = fs.statSync(resolved);
    if (stat.isDirectory()) {
      fs.rmSync(resolved, { recursive: true });
    } else {
      fs.unlinkSync(resolved);
    }
    return { ok: true };
  });
  ipcMain.handle('system:openPath', async (_e, filePath: string) => {
    const { shell } = require('electron');
    await shell.openPath(path.resolve(filePath));
  });

  // --- Review (SQLite local persistence) ---
  // 延迟初始化数据库，直到需要时才创建
  let db: any = null;
  function getReviewDb() {
    if (!db) {
      ensureSettingsPath(); // 确保路径初始化
      const reviewDbPath = path.join(CONFIG_DIR!, 'review.db');
      db = new Database(reviewDbPath);
      db.pragma('journal_mode = WAL');
      db.exec(`
        CREATE TABLE IF NOT EXISTS cards (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          path TEXT,
          archived INTEGER NOT NULL DEFAULT 0,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS anchors (
          card_id TEXT NOT NULL,
          path TEXT,
          start INTEGER,
          end INTEGER,
          anchor_before TEXT,
          anchor_after TEXT,
          hash TEXT,
          PRIMARY KEY(card_id)
        );
        CREATE TABLE IF NOT EXISTS schedules (
          card_id TEXT PRIMARY KEY,
          next_review_at INTEGER NOT NULL,
          interval_days INTEGER NOT NULL,
          ease REAL NOT NULL,
          repetitions INTEGER NOT NULL,
          updated_at INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS reviews (
          id TEXT PRIMARY KEY,
          card_id TEXT NOT NULL,
          reviewed_at INTEGER NOT NULL,
          quality INTEGER NOT NULL,
          interval_after INTEGER NOT NULL,
          ease_after REAL NOT NULL
        );
      `);
    }
    return db;
  }

  // 现在修改所有使用数据库的 IPC 处理器
  ipcMain.handle('review:getAll', async () => {
    const db = getReviewDb();
    const stmt = db.prepare('SELECT * FROM reviews ORDER BY updated_at DESC');
    return stmt.all();
  });

  ipcMain.handle('cards:getAll', async () => {
    const db = getReviewDb();
    const stmt = db.prepare('SELECT * FROM cards ORDER BY updated_at DESC');
    return stmt.all();
  });

  // 初始化完成，数据库表在 getReviewDb() 中创建

  function uuid() { try { return crypto.randomUUID(); } catch { return Math.random().toString(36).slice(2); } }

  ipcMain.handle('review:init', async () => {
    ensureSettingsPath();
    const reviewDbPath = path.join(CONFIG_DIR!, 'review.db');
    return { ok: true, path: reviewDbPath } as const;
  });

  ipcMain.handle('review:cards:listAll', async () => {
    const db = getReviewDb();
    const rows = db.prepare(`
      SELECT c.id, c.title, c.content, c.path, c.archived, s.next_review_at, s.interval_days, s.ease, s.repetitions
      FROM cards c LEFT JOIN schedules s ON s.card_id=c.id
      WHERE c.archived=0
      ORDER BY IFNULL(s.next_review_at, 0) ASC
    `).all();
    return rows;
  });

  ipcMain.handle('review:cards:due', async (_e, now?: number, limit = 100) => {
    const ts = typeof now === 'number' ? now : Date.now();
    const db = getReviewDb();
    const rows = db.prepare(`
      SELECT c.id, c.title, c.content, c.path, s.next_review_at, s.interval_days, s.ease, s.repetitions
      FROM cards c JOIN schedules s ON s.card_id=c.id
      WHERE c.archived=0 AND s.next_review_at <= ?
      ORDER BY s.next_review_at ASC
      LIMIT ?
    `).all(ts, limit);
    return rows;
  });

  ipcMain.handle('review:card:add', async (_e, payload: { title: string; content: string; path?: string }) => {
    const db = getReviewDb();
    const id = uuid();
    const now = Date.now();
    const tx = db.transaction(() => {
      db.prepare('INSERT INTO cards (id,title,content,path,archived,created_at,updated_at) VALUES (?,?,?,?,0,?,?)')
        .run(id, payload.title, payload.content, payload.path || null, now, now);
      db.prepare('INSERT INTO schedules (card_id,next_review_at,interval_days,ease,repetitions,updated_at) VALUES (?,?,?,?,?,?)')
        .run(id, now, 0, 2.5, 0, now);
    });
    tx();
    return { id };
  });

  ipcMain.handle('review:anchor:set', async (_e, payload: { cardId: string; path: string; start: number; end: number; before?: string; after?: string; hash?: string }) => {
    const db = getReviewDb();
    db.prepare('INSERT OR REPLACE INTO anchors (card_id,path,start,end,anchor_before,anchor_after,hash) VALUES (?,?,?,?,?,?,?)')
      .run(payload.cardId, payload.path, payload.start, payload.end, payload.before || null, payload.after || null, payload.hash || null);
    return { ok: true } as const;
  });
  ipcMain.handle('review:anchor:get', async (_e, cardId: string) => {
    const db = getReviewDb();
    const row = db.prepare('SELECT * FROM anchors WHERE card_id=?').get(cardId);
    return row || null;
  });
  ipcMain.handle('review:anchors:byPath', async (_e, filePath: string) => {
    const db = getReviewDb();
    const rows = db.prepare('SELECT * FROM anchors WHERE path=?').all(filePath);
    return rows || [];
  });
  ipcMain.handle('review:card:updateContent', async (_e, cardId: string, content: string) => {
    const db = getReviewDb();
    const now = Date.now();
    db.prepare('UPDATE cards SET content=?, updated_at=? WHERE id=?').run(content, now, cardId);
    return { ok: true } as const;
  });
  ipcMain.handle('review:card:setArchived', async (_e, cardId: string, archived = true) => {
    const db = getReviewDb();
    const now = Date.now();
    db.prepare('UPDATE cards SET archived=?, updated_at=? WHERE id=?').run(archived ? 1 : 0, now, cardId);
    return { ok: true } as const;
  });

  ipcMain.handle('review:card:rate', async (_e, cardId: string, quality: number) => {
    const db = getReviewDb();
    const now = Date.now();
    const s = db.prepare('SELECT * FROM schedules WHERE card_id=?').get(cardId) as any;
    if (!s) return { ok: false };
    let repetitions = s.repetitions;
    let interval_days = s.interval_days;
    let ease = s.ease;
    const q = Math.max(0, Math.min(5, Number(quality)));
    if (q < 3) {
      repetitions = 0;
      interval_days = 1;
    } else {
      const ef = ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
      ease = Math.max(1.3, ef);
      repetitions = repetitions + 1;
      if (repetitions === 1) interval_days = 1;
      else if (repetitions === 2) interval_days = 6;
      else interval_days = Math.round(interval_days * ease);
    }
    const next_review_at = now + interval_days * 24 * 3600 * 1000;
    const tx = db.transaction(() => {
      db.prepare('UPDATE schedules SET next_review_at=?, interval_days=?, ease=?, repetitions=?, updated_at=? WHERE card_id=?')
        .run(next_review_at, interval_days, ease, repetitions, now, cardId);
      db.prepare('INSERT INTO reviews (id,card_id,reviewed_at,quality,interval_after,ease_after) VALUES (?,?,?,?,?,?)')
        .run(uuid(), cardId, now, q, interval_days, ease);
    });
    tx();
    return { ok: true, next_review_at, interval_days, ease, repetitions };
  });

  ipcMain.handle('review:seedMock', async () => {
    const db = getReviewDb();
    const now = Date.now();
    const tx = db.transaction(() => {
      for (let i = 1; i <= 8; i++) {
        const id = uuid();
        db.prepare('INSERT OR IGNORE INTO cards (id,title,content,path,archived,created_at,updated_at) VALUES (?,?,?,?,0,?,?)')
          .run(id, `卡片 ${i}`, `这是第 ${i} 张复习卡片的正反面内容示例。`, null, now, now);
        db.prepare('INSERT OR REPLACE INTO schedules (card_id,next_review_at,interval_days,ease,repetitions,updated_at) VALUES (?,?,?,?,?,?)')
          .run(id, now - (i%3)*3600_000, 0, 2.5, 0, now);
      }
    });
    tx();
    return { ok: true };
  });

  // --- Cloud sync (Supabase) minimal push/pull ---
  function getCloudSettings(): { supabaseUrl?: string; supabaseKey?: string } {
    try {
      const raw = fs.readFileSync(SETTINGS_PATH!, 'utf-8');
      const j = JSON.parse(raw);
      return j.cloud || {};
    } catch {
      return {};
    }
  }
  function setCloudSettings(partial: any) {
    const cur = fs.existsSync(SETTINGS_PATH!) ? JSON.parse(fs.readFileSync(SETTINGS_PATH!, 'utf-8')) : {};
    const next = { ...cur, cloud: { ...(cur.cloud||{}), ...partial } };
    fs.writeFileSync(SETTINGS_PATH!, JSON.stringify(next, null, 2), 'utf-8');
    return next.cloud;
  }
  function getSupabase(): SupabaseClient | null {
    const { supabaseUrl, supabaseKey } = getCloudSettings();
    if (!supabaseUrl || !supabaseKey) return null;
    return createClient(supabaseUrl, supabaseKey);
  }

  ipcMain.handle('cloud:config:get', async () => getCloudSettings());
  ipcMain.handle('cloud:config:set', async (_e, partial: any) => setCloudSettings(partial));

  ipcMain.handle('cloud:review:pushAll', async () => {
    const sb = getSupabase(); if (!sb) return { ok: false, error: 'No Supabase config' } as const;
    const cards = db.prepare('SELECT * FROM cards').all();
    const anchors = db.prepare('SELECT * FROM anchors').all();
    const schedules = db.prepare('SELECT * FROM schedules').all();
    const reviews = db.prepare('SELECT * FROM reviews').all();
    const tables = [
      ['cards', cards],
      ['anchors', anchors],
      ['schedules', schedules],
      ['reviews', reviews],
    ] as const;
    for (const [name, rows] of tables) {
      if (rows.length === 0) continue;
      const { error } = await sb.from(name).upsert(rows as any, { onConflict: name === 'reviews' ? 'id' : 'id' });
      if (error) return { ok: false, error: `${name}: ${error.message}` } as const;
    }
    return { ok: true } as const;
  });

  ipcMain.handle('cloud:review:pullAll', async () => {
    const sb = getSupabase(); if (!sb) return { ok: false, error: 'No Supabase config' } as const;
    const tables = ['cards','anchors','schedules','reviews'] as const;
    for (const name of tables) {
      const { data, error } = await sb.from(name).select('*');
      if (error) return { ok: false, error: `${name}: ${error.message}` } as const;
      const tx = db.transaction(() => {
        if (name === 'cards') db.exec('DELETE FROM cards');
        if (name === 'anchors') db.exec('DELETE FROM anchors');
        if (name === 'schedules') db.exec('DELETE FROM schedules');
        if (name === 'reviews') db.exec('DELETE FROM reviews');
        if (data && data.length) {
          const cols = Object.keys(data[0] as any);
          const placeholders = cols.map(() => '?').join(',');
          const db = getReviewDb();
    const stmt = db.prepare(`INSERT OR REPLACE INTO ${name} (${cols.join(',')}) VALUES (${placeholders})`);
          for (const row of data as any[]) {
            stmt.run(...cols.map(c => (row as any)[c]));
          }
        }
      });
      tx();
    }
    return { ok: true } as const;
  });
}

// 立即注册 IPC 处理器（在模块加载时）
console.log('📡 Registering IPC handlers at module level...');
registerIpcHandlers();

// 应用准备就绪时初始化
app.on('ready', () => {
  console.log('🚀 Electron app ready event triggered');
  
  // 初始化应用
  initializeApp();
  
  // 创建主窗口
  createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  console.log('🪟 All windows closed');
  if (process.platform !== 'darwin') {
    console.log('🛑 Quitting app (not macOS)');
    app.quit();
  }
});

app.on('activate', () => {
  console.log('🔄 App activate event');
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    console.log('🪟 No windows found, creating new window');
    createWindow();
  }
});

app.on('before-quit', () => {
  console.log('🔚 App before-quit event');
});

app.on('will-quit', () => {
  console.log('🛑 App will-quit event');
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
