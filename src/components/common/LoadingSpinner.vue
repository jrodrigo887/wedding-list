<template>
  <div class="loading-spinner" :class="sizeClass">
    <div class="spinner"></div>
    <p v-if="message" class="loading-message">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type SpinnerSize = 'sm' | 'md' | 'lg'

interface Props {
  size?: SpinnerSize
  message?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  message: '',
})

const sizeClass = computed(() => `loading-spinner--${props.size}`)
</script>

<style scoped>
.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
}

.spinner {
  border-radius: 50%;
  border-style: solid;
  border-color: rgba(255, 107, 157, 0.2);
  border-top-color: #ff6b9d;
  animation: spin 0.8s linear infinite;
}

/* Sizes */
.loading-spinner--sm .spinner {
  width: 1.5rem;
  height: 1.5rem;
  border-width: 2px;
}

.loading-spinner--md .spinner {
  width: 3rem;
  height: 3rem;
  border-width: 3px;
}

.loading-spinner--lg .spinner {
  width: 4rem;
  height: 4rem;
  border-width: 4px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-message {
  margin: 0;
  font-size: 0.875rem;
  color: #6c757d;
  text-align: center;
}
</style>
