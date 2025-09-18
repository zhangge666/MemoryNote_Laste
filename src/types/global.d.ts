export {};

declare global {
  interface Window {
    mn: {
      ipc: {
        invoke: (channel: string, ...args: unknown[]) => Promise<any>;
        on: (channel: string, listener: (event: unknown, ...args: unknown[]) => void) => void;
        off: (channel: string, listener: (...args: any[]) => void) => void;
      };
      file: {
        read: (filePath: string) => Promise<string>;
        readText: (filePath: string) => Promise<{ type: 'text'; content: string; encoding: string; size: number; mtime: number }>;
        readBinary: (filePath: string) => Promise<{ type: 'binary'; data: string; size: number; mtime: number; mime: string }>;
        readRange: (filePath: string, start?: number, length?: number) => Promise<{ data: string; start: number; end: number; size: number; mime: string }>;
        stat: (filePath: string) => Promise<{ path: string; isDirectory: boolean; size: number; mtime: number; ctime: number; ext: string; mime: string }>;
      }
    };
  }
}


