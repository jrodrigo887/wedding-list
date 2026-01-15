<template>
  <div class="category-filter">
    <div class="category-filter__pills">
      <button
        v-for="category in categories"
        :key="category"
        :class="['category-pill', { 'category-pill--active': category === modelValue }]"
        @click="$emit('update:modelValue', category)"
      >
        {{ category === 'all' ? 'Todas' : category }}
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  categories: {
    type: Array,
    default: () => ['all'],
  },
  modelValue: {
    type: String,
    default: 'all',
  },
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.category-filter {
  width: 100%;
}

.category-filter__pills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  align-items: center;
}

.category-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: #8B7355;
  background: white;
  border: 1.5px solid #E8DCC8;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.category-pill:hover {
  background: #FFF9F0;
  color: #8B3A3A;
  border-color: #D4A574;
}

.category-pill--active {
  background: #8B3A3A;
  color: #FFF9F0;
  border-color: #8B3A3A;
}

.category-pill--active:hover {
  background: #6B2929;
}

/* Mobile */
@media (max-width: 640px) {
  .category-filter__pills {
    gap: 0.4rem;
  }

  .category-pill {
    padding: 0.4rem 0.75rem;
    font-size: 0.75rem;
  }
}
</style>