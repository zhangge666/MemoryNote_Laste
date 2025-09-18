import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('mn', {
  ipc: {
    invoke: (channel: string, ...args: unknown[]) => ipcRenderer.invoke(channel, ...args),
    on: (channel: string, listener: (event: unknown, ...args: unknown[]) => void) => ipcRenderer.on(channel, listener as any),
    off: (channel: string, listener: (...args: any[]) => void) => ipcRenderer.removeListener(channel, listener as any),
  },
  file: {
    read: (filePath: string) => ipcRenderer.invoke('file:read', filePath),
    readText: (filePath: string) => ipcRenderer.invoke('file:readText', filePath),
    readBinary: (filePath: string) => ipcRenderer.invoke('file:readBinary', filePath),
    readRange: (filePath: string, start?: number, length?: number) => ipcRenderer.invoke('file:readRange', filePath, start, length),
    stat: (filePath: string) => ipcRenderer.invoke('file:stat', filePath),
  }
});
