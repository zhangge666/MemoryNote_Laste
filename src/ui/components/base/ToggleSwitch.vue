<template>
  <button 
    @click="$emit('update:modelValue', !modelValue)"
    class="relative inline-flex items-center h-6 w-11 rounded-full transition-colors duration-300 focus:outline-none"
    :class="[
      modelValue ? 'bg-primary-600' : 'bg-surface-200 dark:bg-surface-600',
      disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
    ]"
    :disabled="disabled"
  >
    <span class="sr-only">{{ ariaLabel }}</span>
    <span 
      class="inline-block w-4 h-4 rounded-full bg-white shadow transform transition-transform duration-300 ease-in-out"
      :class="modelValue ? 'translate-x-6' : 'translate-x-1'"
    />
  </button>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean;
  disabled?: boolean;
  ariaLabel?: string;
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
}

defineProps<Props>();
defineEmits<Emits>();
</script>

