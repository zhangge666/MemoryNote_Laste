<template>
  <div class="h-full w-full overflow-auto">
    <div v-if="!active" class="p-4 text-neutral-500">No tab opened</div>
    <div v-else class="h-full flex flex-col">
      <textarea class="flex-1 w-full outline-none p-4 text-sm bg-transparent" v-model="content" @input="onInput"></textarea>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useTabsStore } from '../../stores/tabs';

const tabs = useTabsStore();
const { active } = storeToRefs(tabs);
const content = ref('');

watch(active, (a) => {
  content.value = a?.content ?? '';
}, { immediate: true });

function onInput() {
  if (active.value) {
    tabs.setContent(active.value.id, content.value);
  }
}
</script>





