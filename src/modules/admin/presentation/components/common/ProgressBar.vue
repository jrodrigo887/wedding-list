<template>
  <div class="progress">
    <div class="progress__header">
      <span class="progress__label">{{ label }}</span>
      <span class="progress__value">{{ value }}%</span>
    </div>
    <div class="progress__bar" :class="variantClass">
      <div
        class="progress__fill"
        :style="{ width: `${Math.min(value, 100)}%` }"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  label: string;
  value: number;
  variant?: 'success' | 'info' | 'warning';
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'success',
});

const variantClass = computed(() => `progress__bar--${props.variant}`);
</script>

<style scoped>
.progress {
  margin-bottom: 1.5rem;
}

.progress:last-child {
  margin-bottom: 0;
}

.progress__header {
  display: flex;
  justify-content: space-between;
  color: #fff;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.progress__label {
  color: #94a3b8;
}

.progress__value {
  font-weight: 600;
}

.progress__bar {
  height: 8px;
  background: #2d2d44;
  border-radius: 4px;
  overflow: hidden;
}

.progress__fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
  background: #10b981;
}

.progress__bar--success .progress__fill {
  background: #10b981;
}

.progress__bar--info .progress__fill {
  background: #3b82f6;
}

.progress__bar--warning .progress__fill {
  background: #f59e0b;
}
</style>
