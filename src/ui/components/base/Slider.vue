<template>
  <div class="space-y-2">
    <label class="block text-sm font-medium text-surface-700 dark:text-surface-300">
      {{ label }} <span class="font-normal text-surface-500 dark:text-surface-400 ml-1">{{ displayValue }}{{ unit }}</span>
    </label>
    <div class="relative flex items-center">
      <input
        type="range"
        :min="min"
        :max="max"
        :step="step"
        :value="modelValue"
        @input="$emit('update:modelValue', parseFloat(($event.target as HTMLInputElement).value))"
        class="w-full h-2 bg-surface-200 dark:bg-surface-600 rounded-lg appearance-none cursor-pointer accent-primary-500"
      />
      <input
        type="number"
        :min="min"
        :max="max"
        :step="step"
        v-model.number="displayValue"
        class="ml-4 w-20 px-3 py-2 text-sm border border-surface-300 dark:border-surface-600 rounded-xl bg-white dark:bg-surface-700 text-surface-900 dark:text-surface-100 focus:border-primary-500 transition-all"
      />
    </div>
    <div v-if="description" class="text-xs text-surface-500 dark:text-surface-400">{{ description }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  modelValue: number;
  min: number;
  max: number;
  step: number;
  label: string;
  unit?: string;
  description?: string;
}>();

const emit = defineEmits(['update:modelValue']);

const displayValue = ref(props.modelValue);

watch(() => props.modelValue, (newValue) => {
  displayValue.value = newValue;
});

watch(displayValue, (newValue) => {
  if (newValue !== props.modelValue) {
    emit('update:modelValue', newValue);
  }
});
</script>


