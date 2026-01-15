<template>
  <section class="pix-section">
    <div class="pix-section__container">
      <div class="pix-section__header">
        <div class="pix-section__icon">💰</div>
        <h2 class="pix-section__title">Contribua via PIX</h2>
        <p class="pix-section__description">
          Prefere dar uma contribuição em dinheiro? Use nossa chave PIX abaixo!
        </p>
      </div>

      <div class="pix-section__content">
        <div class="pix-section__qrcode">
          <div class="pix-section__qrcode-placeholder">
            <img :src="qrcodePix" alt="">
          </div>
        </div>

        <div class="pix-section__details">
          <div class="pix-section__key">
            <label class="pix-section__label">Chave PIX</label>
            <div class="pix-section__key-wrapper">
              <input
                :value="pixKey"
                readonly
                class="pix-section__key-input"
                @focus="$event.target.select()"
              />
              <BaseButton
                variant="primary"
                size="sm"
                :loading="copying"
                @click="handleCopyPix"
              >
                {{ copied ? 'Copiado!' : 'Copiar' }}
              </BaseButton>
            </div>
          </div>

          <div class="pix-section__info">
            <div class="pix-section__info-item">
              <span class="pix-section__info-icon">👤</span>
              <span class="pix-section__info-text">{{ beneficiaryName }}</span>
            </div>
            <div class="pix-section__info-item">
              <span class="pix-section__info-icon">🏦</span>
              <span class="pix-section__info-text">Qualquer valor é bem-vindo!</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { useNotification } from '@/composables/useNotification'
import { copyToClipboard } from '@/utils/helpers'
import { APP_CONFIG, MESSAGES } from '@/utils/constants'
import qrcodePix from '../../assets/qrcode-pix.png'
// ========================================
// Composables
// ========================================
const { success } = useNotification()

// ========================================
// Data
// ========================================
const copying = ref(false)
const copied = ref(false)

// ========================================
// Computed
// ========================================
const pixKey = computed(() => APP_CONFIG.PIX_KEY)
const beneficiaryName = computed(() => `${APP_CONFIG.BENEFICIARY_NAME}`)

// ========================================
// Methods
// ========================================
const handleCopyPix = async () => {
  copying.value = true

  try {
    const result = await copyToClipboard(pixKey.value)

    if (result) {
      copied.value = true
      success(MESSAGES.SUCCESS.COPY)

      // Reset copied state after 2 seconds
      setTimeout(() => {
        copied.value = false
      }, 2000)
    }
  } catch (error) {
    console.error('Erro ao copiar PIX:', error)
  } finally {
    copying.value = false
  }
}
</script>

<style scoped>
.pix-section {
  width: 100%;
  background: linear-gradient(135deg, #F5E6D3 0%, #E8DCC8 100%);
  padding: 4rem 1.5rem;
}

.pix-section__container {
  max-width: 900px;
  margin: 0 auto;
}

.pix-section__header {
  text-align: center;
  margin-bottom: 3rem;
}

.pix-section__icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.pix-section__title {
  margin: 0 0 1rem 0;
  font-size: 2.5rem;
  font-weight: 700;
  color: #3d2b1f;
}

.pix-section__description {
  margin: 0;
  font-size: 1.125rem;
  color: #8B7355;
  max-width: 600px;
  margin: 0 auto;
}

.pix-section__content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  background: white;
  padding: 2rem;
  border: 3px solid #D4A574;
  border-radius: 1.5rem;
  box-shadow: 0 10px 40px rgba(139, 58, 58, 0.15);
}

.pix-section__qrcode {
  display: flex;
  align-items: center;
  justify-content: center;
}

.pix-section__qrcode-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 250px;
  height: 250px;
  background: linear-gradient(135deg, #FFF9F0 0%, #F5E6D3 100%);
  border-radius: 1rem;
  border: 3px dashed #D4A574;
}

.pix-section__qrcode-placeholder span {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.pix-section__qrcode-placeholder p {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #8B7355;
}

.pix-section__details {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  justify-content: center;
}

.pix-section__key {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.pix-section__label {
  font-weight: 700;
  color: #3d2b1f;
  font-size: 1rem;
}

.pix-section__key-wrapper {
  display: flex;
  gap: 0.75rem;
}

.pix-section__key-input {
  flex: 1;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: #3d2b1f;
  background: #FFF9F0;
  border: 2px solid #E8DCC8;
  border-radius: 0.5rem;
  text-align: center;
}

.pix-section__key-input:focus {
  outline: none;
  border-color: #8B3A3A;
  background: white;
}

.pix-section__info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.pix-section__info-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: linear-gradient(135deg, rgba(64, 224, 208, 0.1) 0%, rgba(212, 165, 116, 0.1) 100%);
  border: 2px solid #E8DCC8;
  border-radius: 0.75rem;
}

.pix-section__info-icon {
  font-size: 1.5rem;
}

.pix-section__info-text {
  font-size: 0.875rem;
  color: #3d2b1f;
  font-weight: 500;
}

/* Responsive */
@media (max-width: 768px) {
  .pix-section {
    padding: 3rem 1rem;
  }

  .pix-section__title {
    font-size: 2rem;
  }

  .pix-section__description {
    font-size: 1rem;
  }

  .pix-section__content {
    grid-template-columns: 1fr;
    padding: 1.5rem;
    gap: 2rem;
  }

  .pix-section__qrcode-placeholder {
    width: 200px;
    height: 200px;
  }
}

@media (max-width: 640px) {
  .pix-section__header {
    margin-bottom: 2rem;
  }

  .pix-section__icon {
    font-size: 3rem;
  }

  .pix-section__title {
    font-size: 1.75rem;
  }

  .pix-section__key-wrapper {
    flex-direction: column;
  }

  .pix-section__qrcode-placeholder {
    width: 180px;
    height: 180px;
  }

  .pix-section__qrcode-placeholder span {
    font-size: 3rem;
  }
}
</style>
