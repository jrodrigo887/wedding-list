<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-overlay" @click="handleOverlayClick">
        <div class="modal" @click.stop>
          <button class="modal__close" @click="close">&times;</button>

          <div class="modal__header">
            <h2 class="modal__title">Reservar Presente</h2>
            <p v-if="gift" class="modal__subtitle">{{ gift.name }}</p>
            <div v-if="gift && gift.price" class="modal__price">
              {{ formattedPrice }}
            </div>
          </div>

          <!-- Seletor de modo: Apenas Reservar ou Pagar -->
          <div v-if="showPaymentOption && !selectedMode" class="modal__mode-selector">
            <p class="modal__mode-title">Como deseja reservar?</p>
            <div class="modal__mode-options">
              <button
                type="button"
                class="mode-option mode-option--reserve"
                @click="selectedMode = 'reserve'"
              >
                <span class="mode-option__icon">📝</span>
                <span class="mode-option__label">Apenas Reservar</span>
                <span class="mode-option__desc">Reservo agora e pago depois</span>
              </button>
              <button
                type="button"
                class="mode-option mode-option--pay"
                @click="selectedMode = 'pay'"
              >
                <span class="mode-option__icon">💳</span>
                <span class="mode-option__label">Pagar e Reservar</span>
                <span class="mode-option__desc">Pagar via Infinity Pay</span>
              </button>
            </div>
          </div>

          <!-- Formulário (aparece após selecionar modo ou se não tem opção de pagamento) -->
          <form
            v-if="!showPaymentOption || selectedMode"
            class="modal__form"
            @submit.prevent="handleSubmit"
          >
            <!-- Indicador do modo selecionado -->
            <div v-if="selectedMode" class="modal__selected-mode">
              <span v-if="selectedMode === 'pay'" class="selected-mode-badge selected-mode-badge--pay">
                💳 Pagamento via Infinity Pay
              </span>
              <span v-else class="selected-mode-badge selected-mode-badge--reserve">
                📝 Apenas Reserva
              </span>
              <button type="button" class="change-mode-btn" @click="selectedMode = null">
                Alterar
              </button>
            </div>

            <BaseInput
              v-model="formData.name"
              label="Nome Completo"
              placeholder="Digite seu nome"
              required
              :error="errors.name"
            />

            <BaseInput
              v-model="formData.email"
              type="email"
              label="E-mail"
              placeholder="seu@email.com"
              required
              :error="errors.email"
            />

            <BaseInput
              v-model="formData.phone"
              type="tel"
              label="Telefone"
              placeholder="(11) 99999-9999"
              :error="errors.phone"
            />

            <BaseInput
              v-model="formData.message"
              label="Mensagem (opcional)"
              placeholder="Deixe uma mensagem para os noivos"
            />

            <div class="modal__actions">
              <BaseButton type="button" variant="ghost" @click="close">
                Cancelar
              </BaseButton>
              <BaseButton
                type="submit"
                :variant="selectedMode === 'pay' ? 'success' : 'primary'"
                :loading="submitting"
              >
                {{ submitButtonText }}
              </BaseButton>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useModal } from '@/composables/useModal'
import { useNotification } from '@/composables/useNotification'
import { useGiftStore } from '@/stores/gift.store'
import { infinityPayService } from '@/services/infinitypay.service'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { isValidEmail, isValidName, isValidPhone, sanitizeString, formatCurrency } from '@/utils/helpers'
import { MESSAGES } from '@/utils/constants'

// ========================================
// Composables
// ========================================
const modal = useModal()
const { success, error: showError, info } = useNotification()
const giftStore = useGiftStore()

// ========================================
// Data
// ========================================
const formData = ref({
  name: '',
  email: '',
  phone: '',
  message: '',
})

const errors = ref({
  name: '',
  email: '',
  phone: '',
})

const submitting = ref(false)
const selectedMode = ref(null) // 'reserve' | 'pay' | null

// ========================================
// Computed
// ========================================
const isOpen = computed(() => modal.isOpen.value)
const gift = computed(() => modal.modalData.value)
const formattedPrice = computed(() => gift.value ? formatCurrency(gift.value.price) : '')

// Mostra opção de pagamento se Infinity Pay estiver configurado e presente tiver preço
const showPaymentOption = computed(() => {
  return infinityPayService.isConfigured() && gift.value?.price > 0
})

// Texto do botão de submit baseado no modo
const submitButtonText = computed(() => {
  if (selectedMode.value === 'pay') {
    return 'Ir para Pagamento'
  }
  return 'Confirmar Reserva'
})

// ========================================
// Watch
// ========================================
watch(isOpen, (newValue) => {
  if (!newValue) {
    resetForm()
  }
})

// ========================================
// Methods
// ========================================
const close = () => {
  modal.close()
}

const handleOverlayClick = () => {
  close()
}

const resetForm = () => {
  formData.value = {
    name: '',
    email: '',
    phone: '',
    message: '',
  }
  errors.value = {
    name: '',
    email: '',
    phone: '',
  }
  selectedMode.value = null
}

const validateForm = () => {
  let isValid = true

  // Validate name
  if (!formData.value.name.trim()) {
    errors.value.name = 'Nome é obrigatório'
    isValid = false
  } else if (!isValidName(formData.value.name)) {
    errors.value.name = 'Nome inválido'
    isValid = false
  } else {
    errors.value.name = ''
  }

  // Validate email
  if (!formData.value.email.trim()) {
    errors.value.email = 'E-mail é obrigatório'
    isValid = false
  } else if (!isValidEmail(formData.value.email)) {
    errors.value.email = 'E-mail inválido'
    isValid = false
  } else {
    errors.value.email = ''
  }

  // Validate phone (optional, but must be valid if provided)
  if (formData.value.phone && !isValidPhone(formData.value.phone)) {
    errors.value.phone = 'Telefone inválido'
    isValid = false
  } else {
    errors.value.phone = ''
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) {
    showError(MESSAGES.ERROR.VALIDATION)
    return
  }

  if (!gift.value) {
    showError(MESSAGES.ERROR.GENERIC)
    return
  }

  submitting.value = true

  try {
    // Sanitize data
    const sanitizedData = {
      name: sanitizeString(formData.value.name.trim()),
      email: sanitizeString(formData.value.email.trim()),
      phone: sanitizeString(formData.value.phone.trim()),
      message: sanitizeString(formData.value.message.trim()),
    }

    // Se modo pagamento, redireciona para Infinity Pay
    if (selectedMode.value === 'pay') {
      await handlePayment(sanitizedData)
      return
    }

    // Reserva normal (sem pagamento)
    await giftStore.reserveGift(gift.value.id, sanitizedData)

    success(MESSAGES.SUCCESS.RESERVE)
    close()
  } catch (err) {
    console.error('Erro ao reservar:', err)
    showError(MESSAGES.ERROR.RESERVE)
  } finally {
    submitting.value = false
  }
}

/**
 * Processa pagamento via Infinity Pay
 */
const handlePayment = async (customerData) => {
  try {
    info('Gerando link de pagamento...')

    // Cria link de checkout no Infinity Pay
    const result = await infinityPayService.createCheckoutLink(gift.value, customerData)

    // Salva dados da transação para recuperar após redirecionamento
    infinityPayService.savePendingTransaction({
      giftId: gift.value.id,
      giftName: gift.value.name,
      orderNsu: result.orderNsu,
      customer: customerData,
    })

    // Redireciona para página de pagamento
    if (result.checkoutUrl) {
      window.location.href = result.checkoutUrl
    } else {
      throw new Error('URL de checkout não retornada')
    }
  } catch (err) {
    console.error('Erro ao gerar pagamento:', err)
    showError('Erro ao gerar link de pagamento. Tente novamente.')
    submitting.value = false
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  backdrop-filter: blur(4px);
}

.modal {
  position: relative;
  width: 100%;
  max-width: 500px;
  background: white;
  border: 3px solid #D4A574;
  border-radius: 1.5rem;
  box-shadow: 0 20px 60px rgba(139, 58, 58, 0.3);
  max-height: 90vh;
  overflow-y: auto;
}

.modal__close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F5E6D3;
  border: none;
  border-radius: 50%;
  font-size: 1.5rem;
  color: #8B7355;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 1;
}

.modal__close:hover {
  background: #E8DCC8;
  color: #3d2b1f;
}

.modal__header {
  padding: 2rem 2rem 1rem;
  text-align: center;
  border-bottom: 2px solid #E8DCC8;
}

.modal__title {
  margin: 0 0 0.5rem 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: #3d2b1f;
}

.modal__subtitle {
  margin: 0;
  font-size: 1rem;
  color: #8B3A3A;
  font-weight: 600;
}

.modal__price {
  margin-top: 0.75rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #8B3A3A 0%, #6B2929 100%);
  color: #FFF9F0;
  font-size: 1.5rem;
  font-weight: 700;
  border-radius: 9999px;
  display: inline-block;
  box-shadow: 0 4px 12px rgba(139, 58, 58, 0.3);
}

/* Mode Selector */
.modal__mode-selector {
  padding: 1.5rem 2rem;
  border-bottom: 2px solid #E8DCC8;
}

.modal__mode-title {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #3d2b1f;
  text-align: center;
}

.modal__mode-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.mode-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1.25rem 1rem;
  border: 2px solid #E8DCC8;
  border-radius: 1rem;
  background: #FFF9F0;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mode-option:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.mode-option--reserve:hover {
  border-color: #8B3A3A;
  background: #FFF5F5;
}

.mode-option--pay:hover {
  border-color: #2a9d8f;
  background: #F0FDF9;
}

.mode-option__icon {
  font-size: 2rem;
}

.mode-option__label {
  font-size: 0.95rem;
  font-weight: 700;
  color: #3d2b1f;
}

.mode-option__desc {
  font-size: 0.75rem;
  color: #8B7355;
  text-align: center;
}

/* Selected Mode Badge */
.modal__selected-mode {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: #F5E6D3;
  border-radius: 0.5rem;
  margin-bottom: 0.5rem;
}

.selected-mode-badge {
  font-size: 0.875rem;
  font-weight: 600;
}

.selected-mode-badge--pay {
  color: #2a9d8f;
}

.selected-mode-badge--reserve {
  color: #8B3A3A;
}

.change-mode-btn {
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  color: #8B7355;
  background: white;
  border: 1px solid #E8DCC8;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.change-mode-btn:hover {
  background: #E8DCC8;
  color: #3d2b1f;
}

.modal__form {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.modal__actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.modal__actions > * {
  flex: 1;
}

/* Animations */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .modal,
.modal-leave-active .modal {
  transition: transform 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal,
.modal-leave-to .modal {
  transform: scale(0.9);
}

/* Mobile */
@media (max-width: 640px) {
  .modal {
    max-width: 100%;
    border-radius: 1rem;
  }

  .modal__header {
    padding: 1.5rem 1.5rem 1rem;
  }

  .modal__title {
    font-size: 1.5rem;
  }

  .modal__mode-selector {
    padding: 1.25rem 1.5rem;
  }

  .modal__mode-options {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .mode-option {
    flex-direction: row;
    justify-content: flex-start;
    padding: 1rem;
    gap: 1rem;
  }

  .mode-option__icon {
    font-size: 1.5rem;
  }

  .mode-option__label {
    font-size: 0.9rem;
  }

  .mode-option__desc {
    text-align: left;
  }

  .modal__form {
    padding: 1.5rem;
    gap: 1.25rem;
  }

  .modal__actions {
    flex-direction: column-reverse;
  }
}

/* Scrollbar */
.modal::-webkit-scrollbar {
  width: 8px;
}

.modal::-webkit-scrollbar-track {
  background: #F5E6D3;
}

.modal::-webkit-scrollbar-thumb {
  background: #D4A574;
  border-radius: 4px;
}

.modal::-webkit-scrollbar-thumb:hover {
  background: #C49461;
}
</style>
