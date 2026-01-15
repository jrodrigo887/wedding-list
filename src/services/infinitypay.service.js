// ========================================
// INFINITY PAY SERVICE
// Integração com API de Checkout via Proxy (Google Apps Script)
// ========================================

/**
 * Configuração do Infinity Pay
 */
const getConfig = () => ({
  handle: import.meta.env.VITE_INFINITYPAY_HANDLE || '',
  redirectUrl: import.meta.env.VITE_INFINITYPAY_REDIRECT_URL || `${window.location.origin}?pagamento=confirmado`,
  webhookUrl: import.meta.env.VITE_INFINITYPAY_WEBHOOK_URL || '',
  // URL do Google Apps Script para proxy
  proxyUrl: import.meta.env.VITE_GOOGLE_SCRIPT_URL || '',
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
    return !!config.handle && !!config.proxyUrl
  },

  /**
   * Gera um link de pagamento para um presente
   * Usa o Google Apps Script como proxy para evitar CORS
   * @param {Object} gift - Dados do presente
   * @param {Object} customer - Dados do cliente
   * @returns {Promise<Object>} - URL do checkout e dados da transação
   */
  async createCheckoutLink(gift, customer) {
    const config = getConfig()

    if (!config.handle) {
      throw new Error('Infinity Pay não configurado. Configure VITE_INFINITYPAY_HANDLE no .env')
    }

    if (!config.proxyUrl) {
      throw new Error('URL do Google Apps Script não configurada. Configure VITE_GOOGLE_SCRIPT_URL no .env')
    }

    const orderNsu = `gift_${gift.id}_${Date.now()}`

    // Prepara o payload para o proxy (Google Apps Script)
    const payload = {
      action: 'createCheckoutLink',
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

    console.log('[InfinityPay] Criando link de pagamento via proxy:', payload)

    try {
      // Envia para o Google Apps Script (proxy)
      const response = await fetch(config.proxyUrl, {
        method: 'POST',
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      console.log('[InfinityPay] Resposta do proxy:', data)

      if (!data.success) {
        throw new Error(data.error || 'Erro ao criar link de pagamento')
      }

      return {
        checkoutUrl: data.checkoutUrl || data.url,
        orderNsu: orderNsu,
        ...data,
      }
    } catch (error) {
      console.error('[InfinityPay] Falha ao criar checkout:', error)
      throw error
    }
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
