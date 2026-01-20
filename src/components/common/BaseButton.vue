<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="buttonClasses"
    @click="handleClick"
  >
    <span v-if="loading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
    <slot v-else></slot>
  </button>
</template>

<script setup>
import { computed } from 'vue'

// ========================================
// Props
// ========================================
const props = defineProps({
  type: {
    type: String,
    default: 'button',
    validator: (value) => ['button', 'submit', 'reset'].includes(value),
  },
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'outline', 'ghost', 'danger'].includes(value),
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value),
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  fullWidth: {
    type: Boolean,
    default: false,
  },
})

// ========================================
// Emits
// ========================================
const emit = defineEmits(['click'])

// ========================================
// Computed
// ========================================
const baseClasses = 'relative inline-flex items-center justify-center gap-2 font-semibold rounded-lg cursor-pointer transition-all duration-300 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98]'

const sizeClasses = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
}

const variantClasses = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  outline: 'bg-transparent text-amber-800 border-2 border-amber-600 hover:bg-amber-50 focus-visible:ring-amber-500',
  ghost: 'bg-transparent text-gray-500 hover:bg-amber-50 hover:text-amber-800 focus-visible:ring-amber-500',
  danger: 'bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-lg focus-visible:ring-red-500',
}

const buttonClasses = computed(() => {
  return [
    baseClasses,
    sizeClasses[props.size],
    variantClasses[props.variant],
    {
      'opacity-60 cursor-not-allowed': props.disabled,
      'cursor-wait': props.loading,
      'w-full': props.fullWidth,
    },
  ]
})

// ========================================
// Methods
// ========================================
const handleClick = (event) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>
