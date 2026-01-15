<template>
  <div class="type-filter">
    <button
      v-for="type in types"
      :key="type.value"
      class="type-filter__tab"
      :class="{ 'type-filter__tab--active': modelValue === type.value }"
      @click="$emit('update:modelValue', type.value)"
    >
      {{ type.label }}
      <span v-if="type.count !== undefined" class="type-filter__count">
        {{ type.count }}
      </span>
    </button>
  </div>
</template>

<script setup>
defineProps({
  types: {
    type: Array,
    required: true,
    // Formato: [{ value: 'all', label: 'Todos', count: 10 }]
  },
  modelValue: {
    type: String,
    default: 'all',
  },
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.type-filter {
  display: flex;
  gap: 0;
  background: white;
  border-radius: 0.75rem;
  padding: 0.25rem;
  box-shadow: 0 2px 8px rgba(61, 43, 31, 0.1);
  overflow-x: auto;
}

.type-filter__tab {
  flex: 1;
  min-width: fit-content;
  padding: 0.75rem 1.5rem;
  border: none;
  background: transparent;
  color: #8B7355;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  white-space: nowrap;
}

.type-filter__tab:hover {
  background: #F5E6D3;
  color: #3d2b1f;
}

.type-filter__tab--active {
  background: #8B3A3A;
  color: #FFF9F0;
  box-shadow: 0 2px 8px rgba(139, 58, 58, 0.3);
}

.type-filter__tab--active:hover {
  background: #6B2929;
  color: #FFF9F0;
}

.type-filter__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.5rem;
  height: 1.5rem;
  padding: 0 0.4rem;
  font-size: 0.75rem;
  font-weight: 700;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.2);
}

.type-filter__tab:not(.type-filter__tab--active) .type-filter__count {
  background: rgba(139, 58, 58, 0.1);
  color: #8B3A3A;
}

/* Mobile */
@media (max-width: 640px) {
  .type-filter {
    border-radius: 0.5rem;
  }

  .type-filter__tab {
    padding: 0.6rem 1rem;
    font-size: 0.85rem;
  }
}
</style>