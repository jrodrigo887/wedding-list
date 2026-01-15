// ========================================
// 🎭 COMPOSABLE: useModal
// ========================================

import { ref, readonly } from 'vue'

const isOpen = ref(false)
const modalData = ref(null)

/**
 * Composable para gerenciamento de modais
 * @returns {Object}
 */
export function useModal() {
  /**
   * Abre o modal
   * @param {*} data - Dados a serem passados para o modal
   */
  const open = (data = null) => {
    modalData.value = data
    isOpen.value = true
    // Previne scroll do body quando modal está aberto
    document.body.style.overflow = 'hidden'
  }

  /**
   * Fecha o modal
   */
  const close = () => {
    isOpen.value = false
    modalData.value = null
    // Restaura scroll do body
    document.body.style.overflow = ''
  }

  /**
   * Toggle do modal
   */
  const toggle = () => {
    if (isOpen.value) {
      close()
    } else {
      open()
    }
  }

  return {
    isOpen: readonly(isOpen),
    modalData: readonly(modalData),
    open,
    close,
    toggle,
  }
}
