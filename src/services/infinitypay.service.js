// ========================================
// INFINITY PAY SERVICE
// Integração direta com API de Checkout do InfinityPay
// ========================================

const INFINITYPAY_API_URL = 'https://api.infinitepay.io/invoices/public/checkout/links'

/**
 * Configuração do Infinity Pay
 */
const getConfig = () => ({
  handle: import.meta.env.VITE_INFINITYPAY_HANDLE || '',
  redirectUrl: import.meta.env.VITE_INFINITYPAY_REDIRECT_URL || `${window.location.origin}?pagamento=confirmado`,
  webhookUrl: import.meta.env.VITE_INFINITYPAY_WEBHOOK_URL || '',
  googleScriptUrl: import.meta.env.VITE_GOOGLE_SCRIPT_URL || '',
})

/**
 * Serviço de integração com Infinity Pay
 */
export const infinityPayService = {
  /**
   * Verifica se o Infinity Pay está configurado
   * @returns {boolean}
   */
  isConfigured() {
    const config = getConfig()
    return !!config.handle
  },

  /**
   * Gera um link de pagamento para um presente
   * Chama diretamente a API do InfinityPay
   * @param {Object} gift - Dados do presente
   * @param {Object} customer - Dados do cliente
   * @returns {Promise<Object>} - URL do checkout e dados da transação
   */
  async createCheckoutLink(gift, customer) {
    const config = getConfig()

    if (!config.handle) {
      throw new Error('Infinity Pay não configurado. Configure VITE_INFINITYPAY_HANDLE no .env')
    }

    const orderNsu = `gift_${gift.id}_${Date.now()}`

    // Prepara o payload para a API do InfinityPay
    const payload = {
      handle: config.handle,
      items: [
        {
          quantity: 1,
          price: Math.round(gift.price * 100), // Converte para centavos
          description: `Presente de Casamento: ${gift.name}`,
        },
      ],
      order_nsu: orderNsu,
      redirect_url: `${config.redirectUrl}&gift_id=${gift.id}`,
      customer: {
        name: customer.name,
        email: customer.email,
        ...(customer.phone && { phone_number: customer.phone.replace(/\D/g, '') }),
      },
    }

    // Adiciona webhook se configurado
    if (config.webhookUrl) {
      payload.webhook_url = config.webhookUrl
    }

    console.log('[InfinityPay] Criando link de pagamento:', payload)

    try {
      const response = await fetch(INFINITYPAY_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('[InfinityPay] Erro na resposta:', response.status, errorText)
        throw new Error(`Erro ao criar checkout: ${response.status}`)
      }

      const data = await response.json()
      console.log('[InfinityPay] Resposta:', data)

      return {
        checkoutUrl: data.url || data.checkout_url,
        orderNsu: orderNsu,
        ...data,
      }
    } catch (error) {
      console.error('[InfinityPay] Falha ao criar checkout:', error)
      throw error
    }
  },

  /**
   * Reserva o presente no Google Sheets após pagamento confirmado
   * @param {Object} reservationData - Dados da reserva
   * @returns {Promise<Object>}
   */
  async confirmReservation(reservationData) {
    const config = getConfig()

    if (!config.googleScriptUrl) {
      throw new Error('URL do Google Apps Script não configurada')
    }

    const formData = new FormData()
    formData.append('action', 'reserveGift')
    formData.append('giftId', reservationData.giftId)
    formData.append('nome', reservationData.customer.name)
    formData.append('email', reservationData.customer.email)
    formData.append('telefone', reservationData.customer.phone || '')
    formData.append('mensagem', reservationData.customer.message || 'Pago via Infinity Pay')
    formData.append('pago', 'true')
    formData.append('transactionId', reservationData.orderNsu || '')

    const response = await fetch(config.googleScriptUrl, {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.error || 'Erro ao confirmar reserva')
    }

    return data
  },

  /**
   * Armazena dados da transação pendente no localStorage
   * para recuperar após o redirecionamento
   * @param {Object} transactionData
   */
  savePendingTransaction(transactionData) {
    const pending = {
      ...transactionData,
      createdAt: new Date().toISOString(),
    }
    localStorage.setItem('infinitypay_pending', JSON.stringify(pending))
    console.log('[InfinityPay] Transação pendente salva:', pending)
  },

  /**
   * Recupera dados da transação pendente
   * @returns {Object|null}
   */
  getPendingTransaction() {
    const data = localStorage.getItem('infinitypay_pending')
    if (!data) return null

    const pending = JSON.parse(data)

    // Expira após 1 hora
    const createdAt = new Date(pending.createdAt)
    const now = new Date()
    const hoursDiff = (now - createdAt) / (1000 * 60 * 60)

    if (hoursDiff > 1) {
      this.clearPendingTransaction()
      return null
    }

    return pending
  },

  /**
   * Limpa a transação pendente
   */
  clearPendingTransaction() {
    localStorage.removeItem('infinitypay_pending')
    console.log('[InfinityPay] Transação pendente removida')
  },
}

export default infinityPayService
