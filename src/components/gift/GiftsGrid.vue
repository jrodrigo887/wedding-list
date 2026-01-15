<template>
  <div class="gifts-grid">
    <LoadingSpinner v-if="loading" message="Carregando presentes..." />

    <div v-else-if="error" class="gifts-grid__error">
      <p>{{ error }}</p>
      <BaseButton @click="retry">Tentar Novamente</BaseButton>
    </div>

    <div v-else-if="gifts.length === 0" class="gifts-grid__empty">
      <p>Nenhum presente encontrado nesta categoria.</p>
    </div>

    <div v-else class="gifts-grid__container">
      <TransitionGroup name="gift">
        <GiftCard
          v-for="gift in gifts"
          :key="gift.id"
          :gift="gift"
          @reserve="handleReserve"
        />
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useGiftStore } from '@/stores/gift.store'
import GiftCard from './GiftCard.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import BaseButton from '@/components/common/BaseButton.vue'

// ========================================
// Emits
// ========================================
const emit = defineEmits(['reserve'])

// ========================================
// Store
// ========================================
const giftStore = useGiftStore()

// ========================================
// Computed
// ========================================
const gifts = computed(() => giftStore.filteredGifts)
const loading = computed(() => giftStore.loading)
const error = computed(() => giftStore.error)

// ========================================
// Methods
// ========================================
const handleReserve = (gift) => {
  emit('reserve', gift)
}

const retry = () => {
  giftStore.loadGifts()
}
</script>

<style scoped>
.gifts-grid {
  width: 100%;
}

.gifts-grid__container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  width: 100%;
}

.gifts-grid__error,
.gifts-grid__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 4rem 2rem;
  text-align: center;
}

.gifts-grid__error p,
.gifts-grid__empty p {
  margin: 0;
  font-size: 1.125rem;
  color: #6c757d;
}

/* Animations */
.gift-enter-active,
.gift-leave-active {
  transition: all 0.5s ease;
}

.gift-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.9);
}

.gift-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.gift-move {
  transition: transform 0.5s ease;
}

/* Responsive */
@media (max-width: 1024px) {
  .gifts-grid__container {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
  }
}

@media (max-width: 768px) {
  .gifts-grid__container {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.25rem;
  }
}

@media (max-width: 640px) {
  .gifts-grid__container {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>
