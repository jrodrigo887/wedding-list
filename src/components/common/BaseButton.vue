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

<script setup lang="ts">
import { computed } from 'vue'

type ButtonType = 'button' | 'submit' | 'reset'
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface Props {
  type?: ButtonType
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'button',
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  fullWidth: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const baseClasses =
  'relative inline-flex items-center justify-center gap-2 font-semibold rounded-lg cursor-pointer transition-all duration-300 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98]'

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  outline:
    'bg-transparent text-amber-800 border-2 border-amber-600 hover:bg-amber-50 focus-visible:ring-amber-500',
  ghost:
    'bg-transparent text-gray-500 hover:bg-amber-50 hover:text-amber-800 focus-visible:ring-amber-500',
  danger:
    'bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-lg focus-visible:ring-red-500',
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

const handleClick = (event: MouseEvent): void => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>
