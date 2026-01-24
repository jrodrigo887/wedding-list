<template>
  <div class="stats-card" :class="variantClass">
    <span class="stats-card__label">{{ label }}</span>
    <span class="stats-card__value">{{ formattedValue }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  label: string;
  value: number | string;
  variant?: 'default' | 'success' | 'warning' | 'info';
  format?: 'number' | 'currency' | 'percent';
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  format: 'number',
});

const variantClass = computed(() => `stats-card--${props.variant}`);

const formattedValue = computed(() => {
  const val = Number(props.value);

  switch (props.format) {
    case 'currency':
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(val);
    case 'percent':
      return `${val}%`;
    default:
      return val.toLocaleString('pt-BR');
  }
});
</script>

<style scoped>
.stats-card {
  background: #1a1a2e;
  border-radius: 0.75rem;
  padding: 1rem 1.25rem;
  border-left: 3px solid #64748b;
}

.stats-card--success {
  border-left-color: #10b981;
}

.stats-card--warning {
  border-left-color: #f59e0b;
}

.stats-card--info {
  border-left-color: #3b82f6;
}

.stats-card__label {
  display: block;
  font-size: 0.75rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
}

.stats-card__value {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: #fff;
}

@media (max-width: 640px) {
  .stats-card__value {
    font-size: 1.25rem;
  }
}
</style>
