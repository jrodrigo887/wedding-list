// ========================================
// 🍍 PINIA STORE: Gifts
// ========================================

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import giftService from '@/services/api.service'
import { GIFT_STATUS } from '@/utils/constants'
import { groupBy } from '@/utils/helpers'

export const useGiftStore = defineStore('gift', () => {
  // ========================================
  // State
  // ========================================
  const gifts = ref([])
  const loading = ref(false)
  const error = ref(null)
  const selectedCategory = ref('Todos')

  // ========================================
  // Getters (Computed)
  // ========================================

  /**
   * Lista de categorias únicas
   */
  const categories = computed(() => {
    const uniqueCategories = [...new Set(gifts.value.map((g) => g.category))]
    return ['Todos', ...uniqueCategories.sort()]
  })

  /**
   * Presentes filtrados por categoria
   */
  const filteredGifts = computed(() => {
    if (selectedCategory.value === 'Todos') {
      return gifts.value
    }
    return gifts.value.filter((gift) => gift.category === selectedCategory.value)
  })

  /**
   * Presentes agrupados por categoria
   */
  const giftsByCategory = computed(() => {
    return groupBy(gifts.value, 'category')
  })

  /**
   * Estatísticas gerais
   */
  const stats = computed(() => {
    const total = gifts.value.length
    const reserved = gifts.value.filter((g) => g.status === GIFT_STATUS.RESERVED).length
    const available = total - reserved
    const totalValue = gifts.value.reduce((sum, gift) => sum + gift.price, 0)
    const reservedValue = gifts.value
      .filter((g) => g.status === GIFT_STATUS.RESERVED)
      .reduce((sum, gift) => sum + gift.price, 0)

    return {
      total,
      reserved,
      available,
      totalValue,
      reservedValue,
      availableValue: totalValue - reservedValue,
      percentageReserved: total > 0 ? Math.round((reserved / total) * 100) : 0,
    }
  })

  /**
   * Presentes disponíveis
   */
  const availableGifts = computed(() => {
    return gifts.value.filter((g) => g.status === GIFT_STATUS.AVAILABLE)
  })

  /**
   * Presentes reservados
   */
  const reservedGifts = computed(() => {
    return gifts.value.filter((g) => g.status === GIFT_STATUS.RESERVED)
  })

  // ========================================
  // Actions
  // ========================================

  /**
   * Carrega todos os presentes
   */
  const loadGifts = async () => {
    loading.value = true
    error.value = null

    try {
      const data = await giftService.getGifts()
      gifts.value = data
    } catch (err) {
      error.value = err.message || 'Erro ao carregar presentes'
      console.error('Erro ao carregar presentes:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Busca presente por ID
   * @param {string|number} id
   * @returns {Object|undefined}
   */
  const getGiftById = (id) => {
    return gifts.value.find((gift) => gift.id === id)
  }

  /**
   * Reserva um presente
   * @param {string|number} giftId
   * @param {Object} guestData
   */
  const reserveGift = async (giftId, guestData) => {
    loading.value = true
    error.value = null

    try {
      const response = await giftService.reserveGift(giftId, guestData)

      // Atualiza o status localmente
      const gift = getGiftById(giftId)
      if (gift) {
        gift.status = GIFT_STATUS.RESERVED
        gift.reservedBy = guestData.name
        gift.reservedAt = new Date().toISOString()
      }

      return response
    } catch (err) {
      error.value = err.message || 'Erro ao reservar presente'
      console.error('Erro ao reservar presente:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Define categoria selecionada
   * @param {string} category
   */
  const setCategory = (category) => {
    selectedCategory.value = category
  }

  /**
   * Reseta categoria para "Todos"
   */
  const resetCategory = () => {
    selectedCategory.value = 'Todos'
  }

  /**
   * Limpa erros
   */
  const clearError = () => {
    error.value = null
  }

  /**
   * Reseta store
   */
  const reset = () => {
    gifts.value = []
    loading.value = false
    error.value = null
    selectedCategory.value = 'Todos'
  }

  // ========================================
  // Return
  // ========================================
  return {
    // State
    gifts,
    loading,
    error,
    selectedCategory,

    // Getters
    categories,
    filteredGifts,
    giftsByCategory,
    stats,
    availableGifts,
    reservedGifts,

    // Actions
    loadGifts,
    getGiftById,
    reserveGift,
    setCategory,
    resetCategory,
    clearError,
    reset,
  }
})
