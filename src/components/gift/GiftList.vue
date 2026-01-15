<template>
  <div class="gift-list">
    <!-- Header da lista -->
    <div class="gift-list__header">
      <span class="gift-list__col gift-list__col--name">Presente</span>
      <span class="gift-list__col gift-list__col--category">Categoria</span>
      <span class="gift-list__col gift-list__col--price">Valor</span>
      <span class="gift-list__col gift-list__col--status">Status</span>
      <span class="gift-list__col gift-list__col--action"></span>
    </div>

    <!-- Lista de presentes -->
    <div class="gift-list__body">
      <div
        v-for="gift in gifts"
        :key="gift.id"
        class="gift-list__item"
        :class="{ 'gift-list__item--reserved': gift.status === 'reserved' }"
      >
        <div class="gift-list__col gift-list__col--name">
          <span class="gift-list__name">{{ gift.name }}</span>
          <span class="gift-list__description">{{ gift.description }}</span>
        </div>
        <span class="gift-list__col gift-list__col--category">
          <span class="gift-list__category-badge">{{ gift.category }}</span>
        </span>
        <span class="gift-list__col gift-list__col--price">{{ formatCurrency(gift.price) }}</span>
        <span class="gift-list__col gift-list__col--status">
          <span v-if="gift.status === 'reserved'" class="gift-list__badge gift-list__badge--reserved">
            Reservado
          </span>
          <span v-else class="gift-list__badge gift-list__badge--available">
            Disponível
          </span>
        </span>
        <div class="gift-list__col gift-list__col--action">
          <BaseButton
            v-if="gift.status !== 'reserved'"
            variant="primary"
            size="sm"
            @click="$emit('reserve', gift)"
          >
            Reservar
          </BaseButton>
          <span v-else class="gift-list__reserved-by" :title="gift.reservedBy">
            {{ gift.reservedBy ? `por ${gift.reservedBy}` : '' }}
          </span>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="gifts.length === 0" class="gift-list__empty">
        Nenhum presente encontrado.
      </div>
    </div>
  </div>
</template>

<script setup>
import BaseButton from '@/components/common/BaseButton.vue'
import { formatCurrency } from '@/utils/helpers'

defineProps({
  gifts: {
    type: Array,
    required: true,
  },
})

defineEmits(['reserve'])
</script>

<style scoped>
.gift-list {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.gift-list__header {
  display: grid;
  grid-template-columns: 2fr 1fr 100px 100px 120px;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: #8B3A3A;
  color: #FFF9F0;
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.gift-list__body {
  max-height: 60vh;
  overflow-y: auto;
}

.gift-list__item {
  display: grid;
  grid-template-columns: 2fr 1fr 100px 100px 120px;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #E8DCC8;
  align-items: center;
  transition: background 0.2s ease;
}

.gift-list__item:hover {
  background: #FFF9F0;
}

.gift-list__item--reserved {
  opacity: 0.7;
  background: #f5f5f5;
}

.gift-list__item--reserved:hover {
  background: #f0f0f0;
}

.gift-list__col--name {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.gift-list__name {
  font-weight: 600;
  color: #3d2b1f;
}

.gift-list__description {
  font-size: 0.8rem;
  color: #8B7355;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.gift-list__category-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  font-size: 0.7rem;
  font-weight: 600;
  color: #8B3A3A;
  background: rgba(139, 58, 58, 0.1);
  border-radius: 9999px;
  text-transform: uppercase;
}

.gift-list__col--price {
  font-weight: 700;
  color: #8B3A3A;
}

.gift-list__badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  font-size: 0.7rem;
  font-weight: 600;
  border-radius: 9999px;
  text-transform: uppercase;
}

.gift-list__badge--available {
  background: rgba(64, 224, 208, 0.2);
  color: #2a9d8f;
}

.gift-list__badge--reserved {
  background: rgba(139, 58, 58, 0.1);
  color: #8B3A3A;
}

.gift-list__reserved-by {
  font-size: 0.75rem;
  color: #8B7355;
  font-style: italic;
}

.gift-list__empty {
  padding: 3rem;
  text-align: center;
  color: #8B7355;
}

/* Scrollbar */
.gift-list__body::-webkit-scrollbar {
  width: 8px;
}

.gift-list__body::-webkit-scrollbar-track {
  background: #F5E6D3;
}

.gift-list__body::-webkit-scrollbar-thumb {
  background: #D4A574;
  border-radius: 4px;
}

.gift-list__body::-webkit-scrollbar-thumb:hover {
  background: #C49461;
}

/* Mobile */
@media (max-width: 768px) {
  .gift-list__header {
    display: none;
  }

  .gift-list__item {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem;
    align-items: flex-start;
  }

  .gift-list__col--name {
    width: 100%;
  }

  .gift-list__name {
    font-size: 1rem;
  }

  .gift-list__description {
    white-space: normal;
  }

  .gift-list__col--category,
  .gift-list__col--price,
  .gift-list__col--status {
    display: inline-block;
  }

  .gift-list__item > .gift-list__col--category,
  .gift-list__item > .gift-list__col--price,
  .gift-list__item > .gift-list__col--status {
    margin-right: 0.5rem;
  }

  .gift-list__col--action {
    width: 100%;
    margin-top: 0.5rem;
  }

  .gift-list__col--action .base-button {
    width: 100%;
  }
}
</style>