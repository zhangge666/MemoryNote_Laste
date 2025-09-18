declare module '*.vue' {
	import type { DefineComponent } from 'vue'
	const component: DefineComponent<{}, {}, any>
	export default component
}

declare module 'better-sqlite3';

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
				readText: (filePath: string) => Promise<any>;
				readBinary: (filePath: string) => Promise<any>;
				readRange: (filePath: string, start?: number, length?: number) => Promise<any>;
				stat: (filePath: string) => Promise<any>;
			};
			review?: {
				init: () => Promise<any>;
				listAll: () => Promise<any[]>;
				listDue: (now?: number, limit?: number) => Promise<any[]>;
				addCard: (payload: { title: string; content: string; path?: string }) => Promise<{ id: string }>;
				rate: (cardId: string, quality: number) => Promise<any>;
				seedMock: () => Promise<any>;
				setAnchor: (payload: { cardId: string; path: string; start: number; end: number; before?: string; after?: string; hash?: string }) => Promise<any>;
				getAnchor: (cardId: string) => Promise<any>;
				anchorsByPath: (filePath: string) => Promise<any[]>;
				updateCardContent: (cardId: string, content: string) => Promise<any>;
				setCardArchived: (cardId: string, archived?: boolean) => Promise<any>;
			};
		}
	}
}
export {};




