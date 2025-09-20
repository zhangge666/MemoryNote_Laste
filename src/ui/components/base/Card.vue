<template>
  <div :class="cardClasses">
    <div v-if="$slots.header" class="border-b border-surface-200 dark:border-surface-700 px-6 py-4">
      <slot name="header" />
    </div>
    <div :class="bodyClasses">
      <slot />
    </div>
    <div v-if="$slots.footer" class="border-t border-surface-200 dark:border-surface-700 px-6 py-4">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  padding: 'md',
  hoverable: false
});

const cardClasses = computed(() => {
  const baseClasses = 'bg-white dark:bg-surface-800 rounded-lg overflow-hidden transition-all duration-200';
  
  const variantClasses = {
    default: 'border border-surface-200 dark:border-surface-700',
    elevated: 'shadow-lg border border-surface-200/50 dark:border-surface-700/50',
    outlined: 'border-2 border-surface-200 dark:border-surface-700'
  };
  
  const hoverClasses = props.hoverable ? 'hover:shadow-lg hover:-translate-y-1' : '';
  
  return [baseClasses, variantClasses[props.variant], hoverClasses].join(' ');
});

const bodyClasses = computed(() => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };
  
  return paddingClasses[props.padding];
});
</script>

