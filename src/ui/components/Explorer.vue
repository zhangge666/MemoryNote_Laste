<template>
  <div class="h-full overflow-auto text-sm">
    <div class="p-4 border-b border-surface-200 dark:border-surface-700">
      <div class="flex items-center justify-between mb-3">
        <h3 class="font-semibold text-surface-800 dark:text-surface-200">{{ t('explorer.title') }}</h3>
        <div class="flex gap-1">
          <button class="w-8 h-8 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-colors flex items-center justify-center" @click="createFile" :title="t('explorer.newFile')">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </button>
          <button class="w-8 h-8 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-colors flex items-center justify-center" @click="createFolder" :title="t('explorer.newFolder')">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
            </svg>
          </button>
          <button class="w-8 h-8 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-colors flex items-center justify-center" @click="scan" :title="t('explorer.refresh')">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
          </button>
        </div>
      </div>
      <!-- Inline create input -->
      <div v-if="creating.open" class="flex items-center gap-2">
        <div class="text-surface-500 dark:text-surface-400 text-xs px-2 py-1 rounded bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700">
          {{ creating.type === 'file' ? t('explorer.newFile') : t('explorer.newFolder') }}
        </div>
        <input ref="nameInput" v-model="creating.name" @keydown.enter.prevent="confirmCreate" @keydown.esc.prevent="cancelCreate"
               class="flex-1 px-3 py-2 text-sm border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-700 text-surface-900 dark:text-surface-100"
               :placeholder="creating.type === 'file' ? 'note.md' : 'new-folder'" />
        <button class="px-3 py-2 text-sm rounded-lg bg-primary-500 hover:bg-primary-600 text-white" @click="confirmCreate">OK</button>
        <button class="px-3 py-2 text-sm rounded-lg border border-surface-300 dark:border-surface-600 text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700" @click="cancelCreate">Cancel</button>
      </div>
    </div>
    
    <div class="p-2">
      <div v-for="node in tree" :key="node.path">
        <TreeNode :node="node" @open-file="openFile" @context-menu="onContextMenu" />
      </div>
    </div>
    
    <!-- Context Menu -->
    <div v-if="contextMenu.show" class="fixed bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg shadow-xl text-sm z-50 py-1" :style="{ left: contextMenu.x+'px', top: contextMenu.y+'px' }">
      <button class="w-full px-4 py-2 text-left hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors flex items-center" @click="rename">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
        </svg>
        {{ t('explorer.contextMenu.rename') }}
      </button>
      <button class="w-full px-4 py-2 text-left hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors flex items-center text-red-600" @click="deleteItem">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
        </svg>
        {{ t('explorer.contextMenu.delete') }}
      </button>
      <button class="w-full px-4 py-2 text-left hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors flex items-center" @click="openInSystem">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
        </svg>
        {{ t('explorer.contextMenu.openInSystem') }}
      </button>
    </div>
    
    <!-- Overlay to close context menu -->
    <div v-if="contextMenu.show" class="fixed inset-0 z-40" @click="closeContextMenu"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, reactive, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { useTabGroupsStore } from '../../stores/tabgroups';
import { useSettingsStore } from '../../stores/settings';
import TreeNode from './TreeNode.vue';

const { t } = useI18n();

type TreeNodeType = { type: 'dir'; name: string; path: string; children: TreeNodeType[] } | { type: 'file'; name: string; path: string };

const tree = ref<TreeNodeType[]>([]);
const tabs = useTabGroupsStore();
const settings = useSettingsStore();

const contextMenu = reactive({
  show: false,
  x: 0,
  y: 0,
  path: '',
});

async function scan() {
  const res = await window.mn.ipc.invoke('workspace:scan');
  tree.value = res.tree;
}

async function openFile(filePath: string, e?: MouseEvent) {
  const content = await window.mn.ipc.invoke('file:read', filePath);
  const title = filePath.split(/[\\/]/).pop() || 'file';
  if (e?.shiftKey) {
    const otherLeaf = tabs.getNextLeafId();
    tabs.openInLeaf(otherLeaf, { title, path: filePath, content });
  } else {
    tabs.open({ title, path: filePath, content });
  }
}

const creating = reactive<{ open: boolean; type: 'file'|'folder'; name: string }>({ open: false, type: 'file', name: '' });
const nameInput = ref<HTMLInputElement | null>(null);

function createFile() {
  creating.open = true;
  creating.type = 'file';
  creating.name = '';
  nextTick(() => nameInput.value?.focus());
}

function createFolder() {
  creating.open = true;
  creating.type = 'folder';
  creating.name = '';
  nextTick(() => nameInput.value?.focus());
}

function cancelCreate() {
  creating.open = false;
}

async function confirmCreate() {
  const name = (creating.name || '').trim();
  if (!name) { cancelCreate(); return; }
  const root = settings.data?.workspacePath || '';
  const fullPath = `${root}/${name}`;
  await window.mn.ipc.invoke('file:create', fullPath, creating.type === 'folder');
  cancelCreate();
  scan();
}

function onContextMenu(e: MouseEvent, path: string) {
  contextMenu.show = true;
  contextMenu.x = e.clientX;
  contextMenu.y = e.clientY;
  contextMenu.path = path;
}

function closeContextMenu() {
  contextMenu.show = false;
}

async function rename() {
  const oldPath = contextMenu.path;
  const oldName = oldPath.split(/[\\/]/).pop() || '';
  const newName = prompt('New name:', oldName);
  if (!newName || newName === oldName) return;
  const newPath = oldPath.replace(oldName, newName);
  await window.mn.ipc.invoke('file:rename', oldPath, newPath);
  closeContextMenu();
  scan();
}

async function deleteItem() {
  if (!confirm('Delete this item?')) return;
  await window.mn.ipc.invoke('file:delete', contextMenu.path);
  closeContextMenu();
  scan();
}

async function openInSystem() {
  await window.mn.ipc.invoke('system:openPath', contextMenu.path);
  closeContextMenu();
}

onMounted(scan);

// Auto refresh when workspace path changes
settings.$subscribe((_m, state) => {
  if (state.data) scan();
});

// (moved TreeNode into SFC './TreeNode.vue' to avoid runtime template compilation)
</script>