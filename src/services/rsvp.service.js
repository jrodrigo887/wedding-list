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

    const formData = new FormData()
    formData.append('action', 'confirmPresence')
    formData.append('code', code)

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

    const formData = new FormData()
    formData.append('action', 'cancelPresence')
    formData.append('code', code)

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

  /**
   * Registra check-in (entrada) do convidado no dia do evento
   * @param {string} code - Codigo do convidado
   * @returns {Promise<Object>}
   */
  async registerCheckin(code) {
    const googleScriptUrl = import.meta.env.VITE_GOOGLE_SCRIPT_URL

    if (!googleScriptUrl) {
      throw new Error('URL do Google Apps Script nao configurada')
    }

    const formData = new FormData()
    formData.append('action', 'registerCheckin')
    formData.append('code', code)

    const response = await fetch(googleScriptUrl, {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.error || 'Erro ao registrar check-in')
    }

    return data
  },

  /**
   * Envia QR Code por email para o convidado
   * O QR Code sera gerado no servidor (Google Apps Script) para evitar problemas de tamanho
   * @param {Object} params - Parametros do email
   * @param {string} params.code - Codigo do convidado
   * @param {string} params.email - Email do destinatario
   * @param {string} params.name - Nome do convidado
   * @returns {Promise<Object>}
   */
  async sendQRCodeEmail({ code, email, name }) {
    const googleScriptUrl = import.meta.env.VITE_GOOGLE_SCRIPT_URL

    if (!googleScriptUrl) {
      throw new Error('URL do Google Apps Script nao configurada')
    }

    const formData = new FormData()
    formData.append('action', 'sendQRCodeEmail')
    formData.append('code', code)
    formData.append('email', email)
    formData.append('name', name)

    const response = await fetch(googleScriptUrl, {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.error || 'Erro ao enviar email')
    }

    return data
  },
}

export default rsvpService
