<template>
  <div v-if="showConfirmation" class="payment-confirmation-overlay">
    <div class="payment-confirmation">
      <div class="payment-confirmation__icon">
        <span v-if="status === 'success'">✅</span>
        <span v-else-if="status === 'pending'">⏳</span>
        <span v-else>❌</span>
      </div>

      <h2 class="payment-confirmation__title">
        {{ title }}
      </h2>

      <p class="payment-confirmation__message">
        {{ message }}
      </p>

      <div v-if="pendingTransaction" class="payment-confirmation__details">
        <p><strong>Presente:</strong> {{ pendingTransaction.giftName }}</p>
      </div>

      <div class="payment-confirmation__actions">
        <button class="btn btn--primary" @click="handleClose">
          {{ status === 'success' ? 'Ver Lista de Presentes' : 'Tentar Novamente' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useGiftStore } from '@/stores/gift.store'
import { useNotification } from '@/composables/useNotification'
import { infinityPayService } from '@/services/infinitypay.service'

const giftStore = useGiftStore()
const { success } = useNotification()

const showConfirmation = ref(false)
const status = ref('pending') // 'success' | 'pending' | 'error'
const pendingTransaction = ref(null)

const title = computed(() => {
  switch (status.value) {
    case 'success':
      return 'Pagamento Confirmado!'
    case 'pending':
      return 'Processando Pagamento...'
    default:
      return 'Ops! Algo deu errado'
  }
})

const message = computed(() => {
  switch (status.value) {
    case 'success':
      return 'Seu presente foi reservado com sucesso! Os noivos agradecem seu carinho.'
    case 'pending':
      return 'Estamos confirmando seu pagamento. Isso pode levar alguns segundos...'
    default:
      return 'Não foi possível confirmar o pagamento. Por favor, tente novamente ou entre em contato.'
  }
})

onMounted(async () => {
  // Verifica se é retorno de pagamento
  const urlParams = new URLSearchParams(window.location.search)
  const giftId = urlParams.get('gift_id')

  if (giftId || window.location.pathname.includes('pagamento-confirmado')) {
    showConfirmation.value = true

    // Recupera dados da transação pendente
    pendingTransaction.value = infinityPayService.getPendingTransaction()

    if (pendingTransaction.value) {
      // Simula verificação do pagamento
      // Em produção, isso seria feito pelo webhook
      await checkPaymentStatus()
    } else {
      // Não tem transação pendente, assume sucesso
      status.value = 'success'
    }
  }
})

const checkPaymentStatus = async () => {
  status.value = 'pending'

  try {
    // Confirma a reserva no Google Sheets
    // O pagamento foi feito no InfinityPay, agora registramos a reserva
    if (pendingTransaction.value) {
      await infinityPayService.confirmReservation({
        giftId: pendingTransaction.value.giftId,
        orderNsu: pendingTransaction.value.orderNsu,
        customer: pendingTransaction.value.customer,
      })
    }

    // Recarrega os presentes para ver se foi reservado
    await giftStore.loadGifts()

    status.value = 'success'
    infinityPayService.clearPendingTransaction()
    success('Pagamento confirmado! Presente reservado com sucesso.')
  } catch (err) {
    console.error('Erro ao confirmar reserva:', err)
    // Mesmo com erro na reserva, o pagamento foi feito
    // Mostra sucesso mas loga o erro
    status.value = 'success'
    infinityPayService.clearPendingTransaction()
    console.warn('Pagamento realizado mas houve erro ao registrar reserva:', err)
  }
}

const handleClose = () => {
  // Limpa URL params e fecha modal
  window.history.replaceState({}, document.title, window.location.pathname.split('?')[0])
  showConfirmation.value = false

  // Recarrega presentes
  giftStore.loadGifts()
}
</script>

<style scoped>
.payment-confirmation-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 1rem;
  backdrop-filter: blur(8px);
}

.payment-confirmation {
  background: white;
  border-radius: 1.5rem;
  padding: 2.5rem;
  max-width: 450px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border: 3px solid #2a9d8f;
}

.payment-confirmation__icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.payment-confirmation__title {
  margin: 0 0 1rem 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: #3d2b1f;
}

.payment-confirmation__message {
  margin: 0 0 1.5rem 0;
  font-size: 1rem;
  color: #8B7355;
  line-height: 1.6;
}

.payment-confirmation__details {
  background: #F5E6D3;
  padding: 1rem;
  border-radius: 0.75rem;
  margin-bottom: 1.5rem;
}

.payment-confirmation__details p {
  margin: 0;
  font-size: 0.95rem;
  color: #3d2b1f;
}

.payment-confirmation__actions {
  display: flex;
  justify-content: center;
}

.btn {
  padding: 0.875rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn--primary {
  background: linear-gradient(135deg, #2a9d8f 0%, #40E0D0 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(42, 157, 143, 0.3);
}

.btn--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(42, 157, 143, 0.4);
}

@media (max-width: 640px) {
  .payment-confirmation {
    padding: 2rem 1.5rem;
    border-radius: 1rem;
  }

  .payment-confirmation__icon {
    font-size: 3rem;
  }

  .payment-confirmation__title {
    font-size: 1.5rem;
  }
}
</style>
