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

          <form class="modal__form" @submit.prevent="handleSubmit">
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
              <BaseButton type="submit" variant="primary" :loading="submitting">
                Confirmar Reserva
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
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { isValidEmail, isValidName, isValidPhone, sanitizeString, formatCurrency } from '@/utils/helpers'
import { MESSAGES } from '@/utils/constants'

// ========================================
// Composables
// ========================================
const modal = useModal()
const { success, error: showError } = useNotification()
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

// ========================================
// Computed
// ========================================
const isOpen = computed(() => modal.isOpen.value)
const gift = computed(() => modal.modalData.value)
const formattedPrice = computed(() => (gift.value ? formatCurrency(gift.value.price) : ''))

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
  border: 3px solid #d4a574;
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
  background: #f5e6d3;
  border: none;
  border-radius: 50%;
  font-size: 1.5rem;
  color: #8b7355;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 1;
}

.modal__close:hover {
  background: #e8dcc8;
  color: #3d2b1f;
}

.modal__header {
  padding: 2rem 2rem 1rem;
  text-align: center;
  border-bottom: 2px solid #e8dcc8;
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
  color: #8b3a3a;
  font-weight: 600;
}

.modal__price {
  margin-top: 0.75rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #8b3a3a 0%, #6b2929 100%);
  color: #fff9f0;
  font-size: 1.5rem;
  font-weight: 700;
  border-radius: 9999px;
  display: inline-block;
  box-shadow: 0 4px 12px rgba(139, 58, 58, 0.3);
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
  background: #f5e6d3;
}

.modal::-webkit-scrollbar-thumb {
  background: #d4a574;
  border-radius: 4px;
}

.modal::-webkit-scrollbar-thumb:hover {
  background: #c49461;
}
</style>
