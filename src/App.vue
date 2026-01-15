<template>
  <div id="app">
    <AppHeader />

    <main class="main-content">
      <div class="container">
        <!-- Header com stats inline e botão PIX -->
        <section class="top-bar">
          <div class="stats-inline">
            <span class="stats-inline__item">
              <strong>{{ currentStats.total }}</strong> presentes
            </span>
            <span class="stats-inline__separator">|</span>
            <span class="stats-inline__item stats-inline__item--available">
              <strong>{{ currentStats.available }}</strong> disponíveis
            </span>
            <span class="stats-inline__separator">|</span>
            <span class="stats-inline__item stats-inline__item--reserved">
              <strong>{{ currentStats.reserved }}</strong> reservados
            </span>
          </div>
          <button class="pix-button" @click="showPixModal = true">
            💰 Fazer PIX
          </button>
        </section>

        <!-- Type Filter (Tabs) -->
        <section class="type-filter-section">
          <TypeFilter v-model="selectedType" :types="typeOptions" />
        </section>

        <!-- Category Filter -->
        <section v-if="categoryOptions.length > 2" class="filter-section">
          <CategoryFilter v-model="selectedCategory" :categories="categoryOptions" />
        </section>

        <!-- Gifts List -->
        <section class="gifts-section">
          <div v-if="loading" class="loading">Carregando presentes...</div>
          <GiftList v-else :gifts="filteredGifts" @reserve="handleReserve" />
        </section>
      </div>
    </main>

    <!-- Footer -->
    <footer class="footer">
      <p class="footer__text">
        Feito com 💕 por {{ APP_CONFIG.BRIDE_NAME }} & {{ APP_CONFIG.GROOM_NAME }}
      </p>
    </footer>

    <!-- Reserve Modal -->
    <ReserveModal />

    <!-- PIX Modal -->
    <PixModal :is-open="showPixModal" @close="showPixModal = false" />

    <!-- Notification Container -->
    <NotificationContainer />

    <!-- Payment Confirmation (após retorno do Infinity Pay) -->
    <PaymentConfirmation />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useGiftStore } from '@/stores/gift.store'
import { useModal } from '@/composables/useModal'
import { APP_CONFIG } from '@/utils/constants'

// Components
import AppHeader from '@/components/layout/AppHeader.vue'
import TypeFilter from '@/components/gift/TypeFilter.vue'
import CategoryFilter from '@/components/gift/CategoryFilter.vue'
import GiftList from '@/components/gift/GiftList.vue'
import PixModal from '@/components/pix/PixModal.vue'
import ReserveModal from '@/components/modal/ReserveModal.vue'
import NotificationContainer from '@/components/common/NotificationContainer.vue'
import PaymentConfirmation from '@/components/payment/PaymentConfirmation.vue'

// ========================================
// Composables
// ========================================
const giftStore = useGiftStore()
const modal = useModal()

// ========================================
// State
// ========================================
const selectedType = ref('all')
const selectedCategory = ref('all')
const showPixModal = ref(false)

// ========================================
// Computed
// ========================================
const loading = computed(() => giftStore.loading)
const gifts = computed(() => giftStore.gifts)

// Tipos únicos baseados nos dados
const uniqueTypes = computed(() => {
  const types = [...new Set(gifts.value.map(g => g.type))]
  return types.filter(Boolean)
})

// Opções de tipo para o filtro
const typeOptions = computed(() => {
  const options = [
    { value: 'all', label: 'Todos', count: gifts.value.length }
  ]

  uniqueTypes.value.forEach(type => {
    const count = gifts.value.filter(g => g.type === type).length
    options.push({ value: type, label: type, count })
  })

  return options
})

// Presentes filtrados por tipo
const giftsByType = computed(() => {
  if (selectedType.value === 'all') {
    return gifts.value
  }
  return gifts.value.filter(g => g.type === selectedType.value)
})

// Categorias baseadas no tipo selecionado
const categoryOptions = computed(() => {
  const categories = [...new Set(giftsByType.value.map(g => g.category))]
  return ['all', ...categories.filter(Boolean)]
})

// Presentes filtrados por tipo E categoria
const filteredGifts = computed(() => {
  let result = giftsByType.value

  if (selectedCategory.value !== 'all') {
    result = result.filter(g => g.category === selectedCategory.value)
  }

  return result
})

// Stats baseado no filtro atual
const currentStats = computed(() => {
  const list = filteredGifts.value
  return {
    total: list.length,
    reserved: list.filter(g => g.status === 'reserved').length,
    available: list.filter(g => g.status === 'available').length,
  }
})

// ========================================
// Watch
// ========================================
// Reset categoria quando mudar o tipo
watch(selectedType, () => {
  selectedCategory.value = 'all'
})

// ========================================
// Lifecycle
// ========================================
onMounted(async () => {
  await giftStore.loadGifts()
})

// ========================================
// Methods
// ========================================
const handleReserve = (gift) => {
  modal.open(gift)
}
</script>

<style scoped>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
}

.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* Top Bar - Stats + PIX Button */
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0;
  margin-top: 1rem;
  border-bottom: 1px solid #E8DCC8;
}

.stats-inline {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
  color: #8B7355;
}

.stats-inline__item strong {
  color: #3d2b1f;
  font-weight: 700;
}

.stats-inline__item--available strong {
  color: #2a9d8f;
}

.stats-inline__item--reserved strong {
  color: #8B3A3A;
}

.stats-inline__separator {
  color: #E8DCC8;
}

.pix-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background: linear-gradient(135deg, #2a9d8f 0%, #40E0D0 100%);
  color: white;
  border: none;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(42, 157, 143, 0.3);
}

.pix-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(42, 157, 143, 0.4);
}

/* Type Filter Section */
.type-filter-section {
  padding: 1rem 0;
}

/* Filter Section */
.filter-section {
  padding: 0.5rem 0 1rem;
}

/* Gifts Section */
.gifts-section {
  padding: 0.5rem 0 2rem;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #8B7355;
  font-size: 1rem;
}

/* Footer */
.footer {
  width: 100%;
  padding: 1.25rem;
  background: #3d2b1f;
  color: #FFF9F0;
  text-align: center;
}

.footer__text {
  margin: 0;
  font-size: 0.8rem;
  opacity: 0.9;
}

/* Responsive */
@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }

  .top-bar {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
    text-align: center;
  }

  .stats-inline {
    justify-content: center;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .pix-button {
    justify-content: center;
  }

  .gifts-section {
    padding: 0.5rem 0 1.5rem;
  }
}

@media (max-width: 480px) {
  .stats-inline {
    font-size: 0.8rem;
  }

  .stats-inline__separator {
    display: none;
  }

  .stats-inline__item {
    padding: 0.25rem 0.5rem;
    background: #FFF9F0;
    border-radius: 0.25rem;
  }
}
</style>