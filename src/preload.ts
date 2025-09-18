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
  },
  review: {
    init: () => ipcRenderer.invoke('review:init'),
    listAll: () => ipcRenderer.invoke('review:cards:listAll'),
    listDue: (now?: number, limit?: number) => ipcRenderer.invoke('review:cards:due', now, limit),
    addCard: (payload: any) => ipcRenderer.invoke('review:card:add', payload),
    rate: (cardId: string, quality: number) => ipcRenderer.invoke('review:card:rate', cardId, quality),
    seedMock: () => ipcRenderer.invoke('review:seedMock'),
    setAnchor: (payload: any) => ipcRenderer.invoke('review:anchor:set', payload),
    getAnchor: (cardId: string) => ipcRenderer.invoke('review:anchor:get', cardId),
    anchorsByPath: (filePath: string) => ipcRenderer.invoke('review:anchors:byPath', filePath),
    updateCardContent: (cardId: string, content: string) => ipcRenderer.invoke('review:card:updateContent', cardId, content),
    setCardArchived: (cardId: string, archived?: boolean) => ipcRenderer.invoke('review:card:setArchived', cardId, archived),
  }
});
