<template>
  <article class="gift-card" :class="{ 'gift-card--reserved': isReserved }">
    <div class="gift-card__image-wrapper">
      <img :src="gift.image" :alt="gift.name" class="gift-card__image" loading="lazy" />
      <div v-if="isReserved" class="gift-card__badge">Reservado</div>
    </div>

    <div class="gift-card__content">
      <div class="gift-card__category">{{ gift.category }}</div>
      <h3 class="gift-card__title">{{ gift.name }}</h3>
      <p class="gift-card__description">{{ gift.description }}</p>

      <div class="gift-card__footer">
        <div class="gift-card__price">{{ formattedPrice }}</div>
        <BaseButton
          v-if="!isReserved"
          variant="primary"
          size="sm"
          @click="handleReserve"
        >
          Reservar
        </BaseButton>
        <BaseButton
          v-else
          variant="secondary"
          size="sm"
          disabled
        >
          Indisponível
        </BaseButton>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { formatCurrency } from '@/utils/helpers'
import { GIFT_STATUS } from '@/utils/constants'

// ========================================
// Props
// ========================================
const props = defineProps({
  gift: {
    type: Object,
    required: true,
  },
})

// ========================================
// Emits
// ========================================
const emit = defineEmits(['reserve'])

// ========================================
// Computed
// ========================================
const isReserved = computed(() => props.gift.status === GIFT_STATUS.RESERVED)
const formattedPrice = computed(() => formatCurrency(props.gift.price))

// ========================================
// Methods
// ========================================
const handleReserve = () => {
  emit('reserve', props.gift)
}
</script>

<style scoped>
.gift-card {
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  height: 100%;
}

.gift-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.gift-card--reserved {
  opacity: 0.75;
}

.gift-card--reserved:hover {
  transform: translateY(-4px);
}

.gift-card__image-wrapper {
  position: relative;
  width: 100%;
  padding-top: 75%; /* Aspect ratio 4:3 */
  overflow: hidden;
  background: #f8f9fa;
}

.gift-card__image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.gift-card:hover .gift-card__image {
  transform: scale(1.05);
}

.gift-card__badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.5rem 1rem;
  background: rgba(220, 53, 69, 0.95);
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  border-radius: 9999px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.gift-card__content {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 1.5rem;
  gap: 0.75rem;
}

.gift-card__category {
  display: inline-block;
  width: fit-content;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #8B3A3A;
  background: rgba(139, 58, 58, 0.1);
  border-radius: 9999px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.gift-card__title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #3d2b1f;
  line-height: 1.3;
}

.gift-card__description {
  margin: 0;
  font-size: 0.875rem;
  color: #8B7355;
  line-height: 1.5;
  flex: 1;
}

.gift-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid #E8DCC8;
}

.gift-card__price {
  font-size: 1.5rem;
  font-weight: 700;
  color: #8B3A3A;
}

/* Mobile */
@media (max-width: 640px) {
  .gift-card__content {
    padding: 1.25rem;
  }

  .gift-card__title {
    font-size: 1.125rem;
  }

  .gift-card__price {
    font-size: 1.25rem;
  }
}
</style>
