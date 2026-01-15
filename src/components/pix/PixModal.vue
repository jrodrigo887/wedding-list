<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-overlay" @click="close">
        <div class="modal" @click.stop>
          <button class="modal__close" @click="close">&times;</button>

          <div class="modal__header">
            <h2 class="modal__title">Contribua via PIX</h2>
            <p class="modal__subtitle">Qualquer valor é bem-vindo!</p>
          </div>

          <div class="modal__content">
            <!-- QR Code -->
            <div class="pix__qrcode">
              <img :src="qrcodePix" alt="QR Code PIX" />
            </div>

            <!-- Chave PIX -->
            <div class="pix__key">
              <label class="pix__label">Chave PIX</label>
              <div class="pix__key-wrapper">
                <input
                  :value="pixKey"
                  readonly
                  class="pix__key-input"
                  @focus="$event.target.select()"
                />
                <BaseButton
                  variant="primary"
                  size="sm"
                  @click="handleCopyPix"
                >
                  {{ copied ? 'Copiado!' : 'Copiar' }}
                </BaseButton>
              </div>
            </div>

            <!-- Beneficiário -->
            <div class="pix__beneficiary">
              <span class="pix__beneficiary-label">Beneficiário:</span>
              <span class="pix__beneficiary-name">{{ beneficiaryName }}</span>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { useNotification } from '@/composables/useNotification'
import { copyToClipboard } from '@/utils/helpers'
import { APP_CONFIG, MESSAGES } from '@/utils/constants'
import qrcodePix from '@/assets/qrcode-pix.png'

// Props
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
})

// Emits
const emit = defineEmits(['close'])

// Composables
const { success } = useNotification()

// State
const copied = ref(false)

// Computed
const pixKey = computed(() => APP_CONFIG.PIX_KEY)
const beneficiaryName = computed(() => APP_CONFIG.BENEFICIARY_NAME)

// Methods
const close = () => {
  emit('close')
}

const handleCopyPix = async () => {
  try {
    const result = await copyToClipboard(pixKey.value)
    if (result) {
      copied.value = true
      success(MESSAGES.SUCCESS.COPY)
      setTimeout(() => {
        copied.value = false
      }, 2000)
    }
  } catch (error) {
    console.error('Erro ao copiar PIX:', error)
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
  max-width: 400px;
  background: white;
  border: 3px solid #D4A574;
  border-radius: 1.5rem;
  box-shadow: 0 20px 60px rgba(139, 58, 58, 0.3);
  overflow: hidden;
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
  padding: 1.5rem 1.5rem 1rem;
  text-align: center;
  background: linear-gradient(135deg, #8B3A3A 0%, #6B2929 100%);
  color: #FFF9F0;
}

.modal__title {
  margin: 0 0 0.25rem 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.modal__subtitle {
  margin: 0;
  font-size: 0.875rem;
  opacity: 0.9;
}

.modal__content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.pix__qrcode {
  display: flex;
  justify-content: center;
}

.pix__qrcode img {
  width: 180px;
  height: 180px;
  border-radius: 0.75rem;
  border: 2px solid #E8DCC8;
}

.pix__key {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.pix__label {
  font-weight: 600;
  color: #3d2b1f;
  font-size: 0.875rem;
}

.pix__key-wrapper {
  display: flex;
  gap: 0.5rem;
}

.pix__key-input {
  flex: 1;
  padding: 0.625rem 0.75rem;
  font-size: 0.875rem;
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: #3d2b1f;
  background: #FFF9F0;
  border: 2px solid #E8DCC8;
  border-radius: 0.5rem;
  text-align: center;
}

.pix__key-input:focus {
  outline: none;
  border-color: #8B3A3A;
}

.pix__beneficiary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #FFF9F0;
  border-radius: 0.5rem;
  font-size: 0.875rem;
}

.pix__beneficiary-label {
  color: #8B7355;
}

.pix__beneficiary-name {
  color: #3d2b1f;
  font-weight: 600;
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
    margin: 0 1rem;
  }

  .pix__qrcode img {
    width: 150px;
    height: 150px;
  }

  .pix__key-wrapper {
    flex-direction: column;
  }
}
</style>