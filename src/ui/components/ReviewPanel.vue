<template>
  <div class="h-full w-full flex flex-col">
    <div class="p-4 border-b border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-600 text-white flex items-center justify-center">R</div>
          <div>
            <div class="text-base font-semibold">复习</div>
            <div class="text-xs text-slate-500 dark:text-slate-400">到期卡片：{{ dueCount }} 张</div>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button class="px-3 py-1.5 text-sm rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600" @click="rebuild">刷新队列</button>
          <button class="px-3 py-1.5 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-500" @click="seed">载入示例</button>
          <div class="ml-2 flex items-center gap-2">
            <button class="px-3 py-1.5 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-500" @click="pushCloud">推送云端</button>
            <button class="px-3 py-1.5 text-sm rounded-lg bg-amber-600 text-white hover:bg-amber-500" @click="pullCloud">拉取云端</button>
            <button class="px-3 py-1.5 text-sm rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600" @click="openSource" :disabled="!current">打开来源</button>
          </div>
        </div>
      </div>
    </div>
    <div class="flex-1 min-h-0 grid grid-rows-[1fr_auto]">
      <div class="p-8 overflow-auto">
        <div v-if="!current" class="h-full flex items-center justify-center text-slate-500 dark:text-slate-400">暂无到期卡片</div>
        <div v-else class="max-w-3xl mx-auto">
          <div class="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm p-6 shadow-sm">
            <div class="text-sm text-slate-500 dark:text-slate-400 mb-2">{{ current.title }}</div>
            <div class="text-lg leading-7 whitespace-pre-wrap">{{ current.content }}</div>
          </div>
        </div>
      </div>
      <div class="p-4 border-t border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
        <div class="max-w-3xl mx-auto flex items-center justify-between gap-2">
          <div class="text-xs text-slate-500 dark:text-slate-400">队列：{{ queueLen }}</div>
          <div class="flex items-center gap-2">
            <button class="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600" @click="skip">跳过</button>
            <button class="px-3 py-2 rounded-lg bg-red-500/90 text-white hover:bg-red-500" @click="rate(1)">困难</button>
            <button class="px-3 py-2 rounded-lg bg-amber-500/90 text-white hover:bg-amber-500" @click="rate(3)">一般</button>
            <button class="px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500" @click="rate(5)">容易</button>
          </div>
        </div>
      </div>
    </div>
  </div>
  
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useReviewStore } from '../../stores/review';
import { useTabGroupsStore } from '../../stores/tabgroups';

const review = useReviewStore();
const tabs = useTabGroupsStore();

onMounted(() => {
	review.buildQueue();
});

const dueCount = computed(() => review.dueItems.length);
const current = computed(() => review.current);
const queueLen = computed(() => review.queue.length);

function rate(q: 1|3|5) {
	review.rate(q === 1 ? 1 : q === 3 ? 3 : 5 as any);
}
function skip() { review.skip(); }
function rebuild() { review.buildQueue(); }
function seed() { review.seedMock(); review.buildQueue(); }
async function pushCloud() {
	const res = await review.cloudPushAll();
	alert(res.ok ? '已推送到云端' : `推送失败：${res.error}`);
}
async function pullCloud() {
	const res = await review.cloudPullAll();
	alert(res.ok ? '已从云端拉取' : `拉取失败：${res.error}`);
}
async function openSource() {
	const c = current.value; if (!c || !c.path) { alert('未关联来源路径'); return; }
	// 打开文件到标签
	const content = await (window as any).mn.ipc.invoke('file:read', c.path);
	const tab = tabs.open({ title: c.title || '来源', path: c.path, content });
	// 尝试获取锚点并高亮
	try {
		const a = await (window as any).mn.review?.getAnchor?.(c.id);
		if (a) {
			const leafId = tabs.activeLeafIdOrRoot;
			const leaf = tabs.findLeaf(leafId as any);
			if (leaf) {
				const t = leaf.items.find((i: any) => i.id === (tab?.id || leaf.activeId));
				if (t) { t.selectionStart = a.start ?? 0; t.selectionEnd = a.end ?? 0; }
			}
		}
	} catch {}
}
</script>

<style scoped>
</style>


