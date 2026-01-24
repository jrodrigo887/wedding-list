<template>
  <button
    class="btn"
    :class="[variantClass, sizeClass, { 'btn--block': block }]"
    :disabled="disabled || loading"
    :type="type"
  >
    <span v-if="loading" class="btn__loader"></span>
    <slot v-else></slot>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  loading?: boolean;
  block?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  disabled: false,
  loading: false,
  block: false,
});

const variantClass = computed(() => `btn--${props.variant}`);
const sizeClass = computed(() => `btn--${props.size}`);
</script>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 600;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn--block {
  width: 100%;
}

/* Sizes */
.btn--sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.btn--md {
  padding: 0.75rem 1.5rem;
  font-size: 0.9375rem;
}

.btn--lg {
  padding: 1rem 2rem;
  font-size: 1rem;
}

/* Variants */
.btn--primary {
  background: #3b82f6;
  color: #fff;
}

.btn--primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn--secondary {
  background: #2d2d44;
  color: #94a3b8;
}

.btn--secondary:hover:not(:disabled) {
  background: #3d3d5c;
  color: #fff;
}

.btn--success {
  background: #10b981;
  color: #fff;
}

.btn--success:hover:not(:disabled) {
  background: #059669;
}

.btn--danger {
  background: #ef4444;
  color: #fff;
}

.btn--danger:hover:not(:disabled) {
  background: #dc2626;
}

.btn--ghost {
  background: transparent;
  border: 1px solid #475569;
  color: #94a3b8;
}

.btn--ghost:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Loader */
.btn__loader {
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
