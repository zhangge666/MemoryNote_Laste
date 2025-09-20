<template>
  <div class="relative" ref="dropdownRef">
    <button
      @click="toggleDropdown"
      class="w-full px-4 py-3 text-sm border border-surface-300 dark:border-surface-600 rounded-xl bg-white dark:bg-surface-700 text-surface-900 dark:text-surface-100 focus:border-primary-500 transition-all text-left flex items-center justify-between"
      :class="{ 'border-primary-500': isOpen }"
    >
      <span>{{ selectedLabel }}</span>
      <svg 
        class="w-5 h-5 text-surface-400 transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
      </svg>
    </button>
    
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <div
        v-if="isOpen"
        class="absolute z-50 w-full mt-2 bg-white dark:bg-surface-700 border border-surface-200 dark:border-surface-600 rounded-xl shadow-lg overflow-hidden"
      >
        <div class="max-h-60 overflow-auto">
          <button
            v-for="option in options"
            :key="option.value"
            @click="selectOption(option)"
            class="w-full px-4 py-3 text-left text-sm hover:bg-surface-50 dark:hover:bg-surface-600 transition-colors flex items-center justify-between"
            :class="{
              'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300': option.value === modelValue,
              'text-surface-900 dark:text-surface-100': option.value !== modelValue
            }"
          >
            <span>{{ option.label }}</span>
            <svg
              v-if="option.value === modelValue"
              class="w-4 h-4 text-primary-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

interface DropdownOption {
  value: string;
  label: string;
}

const props = defineProps<{
  modelValue: string;
  options: DropdownOption[];
  placeholder?: string;
}>();

const emit = defineEmits(['update:modelValue']);

const isOpen = ref(false);
const dropdownRef = ref<HTMLElement>();

const selectedLabel = computed(() => {
  const selected = props.options.find(option => option.value === props.modelValue);
  return selected?.label || props.placeholder || '请选择';
});

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const selectOption = (option: DropdownOption) => {
  emit('update:modelValue', option.value);
  isOpen.value = false;
};

const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>
