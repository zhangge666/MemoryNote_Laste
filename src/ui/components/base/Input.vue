<template>
  <div class="relative">
    <label v-if="label" :for="inputId" class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1">*</span>
    </label>
    
    <div class="relative">
      <div v-if="$slots.prefix" class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <slot name="prefix" />
      </div>
      
      <input
        :id="inputId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :class="inputClasses"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        @blur="$emit('blur', $event)"
        @focus="$emit('focus', $event)"
        @keydown="$emit('keydown', $event)"
      />
      
      <div v-if="$slots.suffix" class="absolute inset-y-0 right-0 pr-3 flex items-center">
        <slot name="suffix" />
      </div>
    </div>
    
    <p v-if="error" class="mt-2 text-sm text-red-600 dark:text-red-400">{{ error }}</p>
    <p v-else-if="hint" class="mt-2 text-sm text-surface-500 dark:text-surface-400">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  modelValue?: string | number;
  type?: 'text' | 'email' | 'password' | 'number' | 'search' | 'tel' | 'url';
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  error?: string;
  hint?: string;
  size?: 'sm' | 'md' | 'lg';
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  size: 'md'
});

defineEmits<{
  'update:modelValue': [value: string];
  blur: [event: FocusEvent];
  focus: [event: FocusEvent];
  keydown: [event: KeyboardEvent];
}>();

const inputId = computed(() => `input-${Math.random().toString(36).slice(2)}`);

const inputClasses = computed(() => {
  const baseClasses = 'block w-full rounded-lg border transition-colors duration-200 focus:outline-none';
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base'
  };
  
  const stateClasses = props.error
    ? 'border-red-300 dark:border-red-600 focus:border-red-500'
    : 'border-surface-300 dark:border-surface-600 focus:border-primary-500';
  
  const disabledClasses = props.disabled
    ? 'bg-surface-50 dark:bg-surface-700 text-surface-500 dark:text-surface-400 cursor-not-allowed'
    : 'bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100';
  
  const prefixClasses = props.$slots?.prefix ? 'pl-10' : '';
  const suffixClasses = props.$slots?.suffix ? 'pr-10' : '';
  
  return [
    baseClasses,
    sizeClasses[props.size],
    stateClasses,
    disabledClasses,
    prefixClasses,
    suffixClasses
  ].join(' ');
});
</script>
