// ========================================
// SERVICO DE RSVP - CONFIRMACAO DE PRESENCA
// ========================================

/**
 * Servico para gerenciar confirmacao de presenca dos convidados
 */
export const rsvpService = {
  /**
   * Verifica se o codigo do convidado existe
   * @param {string} code - Codigo do convidado
   * @returns {Promise<Object>}
   */
  async checkGuestCode(code) {
    const googleScriptUrl = import.meta.env.VITE_GOOGLE_SCRIPT_URL

    if (!googleScriptUrl) {
      throw new Error('URL do Google Apps Script nao configurada')
    }
  
    const response = await fetch(`${googleScriptUrl}?action=checkGuest&code=${encodeURIComponent(code)}`)
    const data = await response.json()

    if (!data.success) {
      throw new Error(data.error || 'Codigo nao encontrado')
    }

    return data.guest
  },

  /**
   * Confirma presenca do convidado
   * @param {string} code - Codigo do convidado
   * @returns {Promise<Object>}
   */
  async confirmPresence(code) {
    const googleScriptUrl = import.meta.env.VITE_GOOGLE_SCRIPT_URL

    if (!googleScriptUrl) {
      throw new Error('URL do Google Apps Script nao configurada')
    }

    const payload = {
      action: 'confirmPresence',
      code: code,
    }

    const formData = new FormData()
    Object.keys(payload).forEach(key => formData.append(key, payload[key]))

    const response = await fetch(googleScriptUrl, {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.error || 'Erro ao confirmar presenca')
    }

    return data
  },

  async cancelPresence(code) {
    const googleScriptUrl = import.meta.env.VITE_GOOGLE_SCRIPT_URL

    if (!googleScriptUrl) {
      throw new Error('URL do Google Apps Script nao configurada')
    }

    const payload = {
      action: 'cancelPresence',
      code: code,
    }

    const formData = new FormData()
    Object.keys(payload).forEach(key => formData.append(key, payload[key]))

    const response = await fetch(googleScriptUrl, {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.error || 'Erro ao cancelar presença')
    }

    return data
  },
}

export default rsvpService
