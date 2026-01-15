// ========================================
// 🛠️ FUNÇÕES AUXILIARES
// ========================================

import { VALIDATION_RULES } from './constants'

/**
 * Copia texto para a área de transferência
 * @param {string} text - Texto a ser copiado
 * @returns {Promise<boolean>}
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.error('Erro ao copiar:', error)
    return false
  }
}

/**
 * Formata data para exibição
 * @param {string|Date} date - Data a ser formatada
 * @param {string} locale - Locale (padrão: pt-BR)
 * @returns {string}
 */
export const formatDate = (date, locale = 'pt-BR') => {
  let dateObj
  if (date instanceof Date) {
    dateObj = date
  } else if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    // Para strings no formato YYYY-MM-DD, adiciona T12:00 para evitar problemas de timezone
    const [year, month, day] = date.split('-')
    dateObj = new Date(year, month - 1, day)
  } else {
    dateObj = new Date(date)
  }
  return dateObj.toLocaleDateString(locale, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Formata moeda brasileira
 * @param {number} value - Valor numérico
 * @returns {string}
 */
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

/**
 * Debounce - Atrasa execução de função
 * @param {Function} func - Função a ser executada
 * @param {number} delay - Atraso em ms
 * @returns {Function}
 */
export const debounce = (func, delay = 300) => {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

/**
 * Throttle - Limita execução de função
 * @param {Function} func - Função a ser executada
 * @param {number} limit - Limite em ms
 * @returns {Function}
 */
export const throttle = (func, limit = 300) => {
  let inThrottle
  return (...args) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Valida email
 * @param {string} email
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  return VALIDATION_RULES.EMAIL.PATTERN.test(email)
}

/**
 * Valida nome
 * @param {string} name
 * @returns {boolean}
 */
export const isValidName = (name) => {
  return (
    name.length >= VALIDATION_RULES.NAME.MIN_LENGTH &&
    name.length <= VALIDATION_RULES.NAME.MAX_LENGTH &&
    VALIDATION_RULES.NAME.PATTERN.test(name)
  )
}

/**
 * Valida telefone brasileiro
 * @param {string} phone
 * @returns {boolean}
 */
export const isValidPhone = (phone) => {
  return VALIDATION_RULES.PHONE.PATTERN.test(phone)
}

/**
 * Sanitiza string (remove tags HTML)
 * @param {string} str
 * @returns {string}
 */
export const sanitizeString = (str) => {
  const div = document.createElement('div')
  div.textContent = str
  return div.innerHTML
}

/**
 * Gera ID único
 * @returns {string}
 */
export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Capitaliza primeira letra
 * @param {string} str
 * @returns {string}
 */
export const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Remove acentos de string
 * @param {string} str
 * @returns {string}
 */
export const removeAccents = (str) => {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

/**
 * Trunca texto
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export const truncate = (text, maxLength = 50) => {
  if (text.length <= maxLength) return text
  return `${text.substring(0, maxLength)}...`
}

/**
 * Agrupa array por propriedade
 * @param {Array} array
 * @param {string} key
 * @returns {Object}
 */
export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const group = item[key]
    result[group] = result[group] || []
    result[group].push(item)
    return result
  }, {})
}

/**
 * Ordena array por propriedade
 * @param {Array} array
 * @param {string} key
 * @param {string} order - 'asc' ou 'desc'
 * @returns {Array}
 */
export const sortBy = (array, key, order = 'asc') => {
  return [...array].sort((a, b) => {
    const valueA = a[key]
    const valueB = b[key]

    if (order === 'asc') {
      return valueA > valueB ? 1 : -1
    } else {
      return valueA < valueB ? 1 : -1
    }
  })
}

/**
 * Verifica se está em dispositivo mobile
 * @returns {boolean}
 */
export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
}

/**
 * Sleep/Delay
 * @param {number} ms - Milissegundos
 * @returns {Promise}
 */
export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Formata telefone brasileiro
 * @param {string} phone
 * @returns {string}
 */
export const formatPhone = (phone) => {
  const cleaned = phone.replace(/\D/g, '')
  const match = cleaned.match(/^(\d{2})(\d{4,5})(\d{4})$/)
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`
  }
  return phone
}

/**
 * Scroll suave até elemento
 * @param {string} selector - Seletor CSS
 * @param {number} offset - Offset em pixels
 */
export const smoothScrollTo = (selector, offset = 0) => {
  const element = document.querySelector(selector)
  if (element) {
    const top = element.offsetTop - offset
    window.scrollTo({ top, behavior: 'smooth' })
  }
}
