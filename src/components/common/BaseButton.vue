<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="buttonClasses"
    @click="handleClick"
  >
    <span v-if="loading" class="spinner"></span>
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
const buttonClasses = computed(() => {
  return [
    'base-button',
    `base-button--${props.variant}`,
    `base-button--${props.size}`,
    {
      'base-button--disabled': props.disabled,
      'base-button--loading': props.loading,
      'base-button--full-width': props.fullWidth,
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

<style scoped>
.base-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 600;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
  white-space: nowrap;
}

/* Sizes */
.base-button--sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.base-button--md {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
}

.base-button--lg {
  padding: 1rem 2rem;
  font-size: 1.125rem;
}

/* Variants */
.base-button--primary {
  background: #8B3A3A;
  color: #FFF9F0;
  box-shadow: 0 2px 8px rgba(139, 58, 58, 0.2);
  border: 1px solid rgba(107, 41, 41, 0.3);
}

.base-button--primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(139, 58, 58, 0.25);
  background: #6B2929;
}

.base-button--secondary {
  background: #D4A574;
  color: #3d2b1f;
  border: 1px solid #C49461;
  box-shadow: 0 2px 6px rgba(212, 165, 116, 0.2);
}

.base-button--secondary:hover:not(:disabled) {
  background: #C49461;
  border-color: #B4845F;
  box-shadow: 0 3px 8px rgba(212, 165, 116, 0.25);
}

.base-button--outline {
  background: transparent;
  color: #8B3A3A;
  border: 1.5px solid #8B3A3A;
}

.base-button--outline:hover:not(:disabled) {
  background: rgba(139, 58, 58, 0.08);
  border-color: #6B2929;
}

.base-button--ghost {
  background: transparent;
  color: #8B7355;
}

.base-button--ghost:hover:not(:disabled) {
  background: rgba(212, 165, 116, 0.1);
}

.base-button--danger {
  background: #dc3545;
  color: white;
}

.base-button--danger:hover:not(:disabled) {
  background: #c82333;
}

/* States */
.base-button:disabled,
.base-button--disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.base-button--loading {
  cursor: wait;
}

.base-button--full-width {
  width: 100%;
}

/* Spinner */
.spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Focus */
.base-button:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(139, 58, 58, 0.2);
}

.base-button--secondary:focus-visible {
  box-shadow: 0 0 0 3px rgba(212, 165, 116, 0.3);
}

.base-button--outline:focus-visible {
  box-shadow: 0 0 0 3px rgba(139, 58, 58, 0.15);
}

/* Active */
.base-button:active:not(:disabled) {
  transform: scale(0.98);
}
</style>
