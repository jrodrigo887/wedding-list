// ========================================
// 🔔 COMPOSABLE: useNotification
// ========================================

import { ref } from 'vue'
import { generateId } from '@/utils/helpers'
import { APP_CONFIG, NOTIFICATION_TYPES } from '@/utils/constants'

const notifications = ref([])

/**
 * Composable para sistema de notificações/toasts
 * @returns {Object}
 */
export function useNotification() {
  /**
   * Adiciona notificação
   * @param {string} message - Mensagem
   * @param {string} type - Tipo (success, error, warning, info)
   * @param {number} duration - Duração em ms
   */
  const addNotification = (
    message,
    type = NOTIFICATION_TYPES.INFO,
    duration = APP_CONFIG.NOTIFICATION_DURATION
  ) => {
    const id = generateId()
    const notification = {
      id,
      message,
      type,
      duration,
    }

    notifications.value.push(notification)

    // Auto-remove após duração
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, duration)
    }

    return id
  }

  /**
   * Remove notificação
   * @param {string} id - ID da notificação
   */
  const removeNotification = (id) => {
    const index = notifications.value.findIndex((n) => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  /**
   * Remove todas as notificações
   */
  const clearAll = () => {
    notifications.value = []
  }

  /**
   * Notificação de sucesso
   * @param {string} message
   * @param {number} duration
   */
  const success = (message, duration) => {
    return addNotification(message, NOTIFICATION_TYPES.SUCCESS, duration)
  }

  /**
   * Notificação de erro
   * @param {string} message
   * @param {number} duration
   */
  const error = (message, duration) => {
    return addNotification(message, NOTIFICATION_TYPES.ERROR, duration)
  }

  /**
   * Notificação de aviso
   * @param {string} message
   * @param {number} duration
   */
  const warning = (message, duration) => {
    return addNotification(message, NOTIFICATION_TYPES.WARNING, duration)
  }

  /**
   * Notificação informativa
   * @param {string} message
   * @param {number} duration
   */
  const info = (message, duration) => {
    return addNotification(message, NOTIFICATION_TYPES.INFO, duration)
  }

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    success,
    error,
    warning,
    info,
  }
}
