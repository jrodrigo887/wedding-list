<template>
  <div class="rsvp-page">
    <div class="rsvp-container">
      <!-- Header -->
      <header class="rsvp-header">
        <div class="rsvp-header__icon">💒</div>
        <h1 class="rsvp-header__title">Confirmacao de Presenca</h1>
        <p class="rsvp-header__subtitle">
          {{ APP_CONFIG.BRIDE_NAME }} & {{ APP_CONFIG.GROOM_NAME }}
        </p>
      </header>

      <!-- Form de busca por codigo -->
      <div v-if="!guest && !confirmed && !declined" class="rsvp-form">
        <p class="rsvp-form__instruction">
          Digite o codigo que esta no seu convite para confirmar sua presenca
        </p>

        <div class="rsvp-form__input-group">
          <div class="rsvp-form__input-wrapper">
            <span class="rsvp-form__prefix">RE:</span>
            <input
              v-model="code"
              type="text"
              class="rsvp-form__input rsvp-form__input--with-prefix"
              placeholder="00"
              :disabled="loading"
              @input="onCodeInput"
              @keyup.enter="checkCode"
            />
          </div>
          <button
            class="rsvp-form__button"
            :disabled="loading || !code.trim()"
            @click="checkCode"
          >
            <span v-if="loading">Verificando...</span>
            <span v-else>Verificar</span>
          </button>
        </div>

        <p v-if="error" class="rsvp-form__error">
          {{ error }}
        </p>
      </div>

      <!-- Dados do convidado encontrado -->
      <div v-if="guest && !confirmed && !declined" class="rsvp-guest">
        <div class="rsvp-guest__card">
          <div class="rsvp-guest__icon">👋</div>
          <h2 class="rsvp-guest__greeting">
            Ola, {{ guest.nome }}{{ guest.parceiro ? ` e ${guest.parceiro}` : '' }}!
          </h2>

          <div class="rsvp-guest__details">
            <div class="rsvp-guest__detail">
              <span class="rsvp-guest__label">Codigo:</span>
              <span class="rsvp-guest__value">{{ guest.codigo }}</span>
            </div>

            <div v-if="guest.acompanhantes > 0" class="rsvp-guest__detail">
              <span class="rsvp-guest__label">Acompanhantes:</span>
              <span class="rsvp-guest__value">{{ guest.acompanhantes }}</span>
            </div>

            <div class="rsvp-guest__detail">
              <span class="rsvp-guest__label">Total de pessoas:</span>
              <span class="rsvp-guest__value">{{ totalPeople }}</span>
            </div>
          </div>

          <div v-if="guest.confirmado" class="rsvp-guest__already-confirmed">
            <span class="rsvp-guest__check">✅</span>
            <p>Sua presenca ja foi confirmada anteriormente!</p>
            <button
              class="rsvp-guest__cancel-link"
              @click="showCancelModal = true"
            >
              Cancelar presenca
            </button>
          </div>

          <div v-else class="rsvp-guest__actions">
            <p class="rsvp-guest__confirm-text">
              Deseja confirmar sua presenca no casamento?
            </p>
            <div class="rsvp-guest__buttons">
              <button
                class="rsvp-guest__confirm-button"
                :disabled="confirming"
                @click="confirmPresence"
              >
                <span v-if="confirming">Confirmando...</span>
                <span v-else>Confirmar Presenca</span>
              </button>
              <button
                class="rsvp-guest__decline-button"
                :disabled="confirming"
                @click="showDeclineModal = true"
              >
                Nao poderei ir
              </button>
            </div>
          </div>

          <button class="rsvp-guest__back" @click="reset">
            ← Voltar
          </button>
        </div>
      </div>

      <!-- Confirmacao bem-sucedida -->
      <div v-if="confirmed" class="rsvp-success">
        <div class="rsvp-success__card">
          <div class="rsvp-success__icon">🎉</div>
          <h2 class="rsvp-success__title">Presenca Confirmada!</h2>
          <p class="rsvp-success__message">
            {{ confirmationMessage }}
          </p>

          <!-- QR Code Section -->
          <div class="rsvp-qrcode">
            <h3 class="rsvp-qrcode__title">Seu QR Code para Check-in</h3>
            <p class="rsvp-qrcode__subtitle">
              Apresente este codigo na entrada do evento
            </p>

            <div v-if="qrCodeLoading" class="rsvp-qrcode__loading">
              Gerando QR Code...
            </div>

            <div v-else-if="qrCodeDataUrl" class="rsvp-qrcode__image-container">
              <img :src="qrCodeDataUrl" alt="QR Code para check-in" class="rsvp-qrcode__image" />
              <p class="rsvp-qrcode__code">{{ getFullCode() }}</p>
            </div>

            <div class="rsvp-qrcode__actions">
              <button
                class="rsvp-qrcode__download-btn"
                :disabled="!qrCodeDataUrl"
                @click="downloadQRCode"
              >
                📥 Salvar QR Code
              </button>
            </div>

            <!-- Email Section -->
            <div v-if="!emailSent" class="rsvp-qrcode__email">
              <p class="rsvp-qrcode__email-label">Receber QR Code por email:</p>
              <div class="rsvp-qrcode__email-form">
                <input
                  v-model="guestEmail"
                  type="email"
                  class="rsvp-qrcode__email-input"
                  placeholder="seu@email.com"
                  :disabled="emailSending"
                />
                <button
                  class="rsvp-qrcode__email-btn"
                  :disabled="emailSending || !guestEmail.trim()"
                  @click="sendQRCodeByEmail"
                >
                  <span v-if="emailSending">Enviando...</span>
                  <span v-else>Enviar</span>
                </button>
              </div>
              <p v-if="emailError" class="rsvp-qrcode__email-error">
                {{ emailError }}
              </p>
            </div>

            <div v-else class="rsvp-qrcode__email-success">
              ✅ QR Code enviado para {{ guestEmail }}
            </div>
          </div>

          <p class="rsvp-success__see-you">
            Nos vemos no grande dia!
          </p>
          <p class="rsvp-success__date">
            {{ formattedWeddingDate }}
          </p>

          <div class="rsvp-success__actions">
            <button class="rsvp-success__button" @click="reset">
              Nova Confirmacao
            </button>
            <router-link to="/" class="rsvp-success__link">
              Ver Lista de Presentes →
            </router-link>
          </div>
        </div>
      </div>

      <!-- Modal de Cancelamento -->
      <div v-if="showCancelModal" class="rsvp-modal-overlay" @click.self="showCancelModal = false">
        <div class="rsvp-modal">
          <div class="rsvp-modal__icon">⚠️</div>
          <h3 class="rsvp-modal__title">Cancelar Presenca</h3>
          <p class="rsvp-modal__message">
            Tem certeza que deseja cancelar sua presenca no casamento?
          </p>
          <p class="rsvp-modal__warning">
            Esta acao ira remover sua confirmacao e voce precisara confirmar novamente caso mude de ideia.
          </p>
          <div class="rsvp-modal__actions">
            <button
              class="rsvp-modal__button rsvp-modal__button--secondary"
              @click="showCancelModal = false"
              :disabled="cancelling"
            >
              Voltar
            </button>
            <button
              class="rsvp-modal__button rsvp-modal__button--danger"
              @click="cancelPresence"
              :disabled="cancelling"
            >
              <span v-if="cancelling">Cancelando...</span>
              <span v-else>Confirmar Cancelamento</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Modal de Nao Comparecimento -->
      <div v-if="showDeclineModal" class="rsvp-modal-overlay" @click.self="showDeclineModal = false">
        <div class="rsvp-modal">
          <div class="rsvp-modal__icon">😢</div>
          <h3 class="rsvp-modal__title">Nao poderei comparecer</h3>
          <p class="rsvp-modal__message">
            Que pena que voce nao podera estar presente no nosso casamento!
          </p>
          <p class="rsvp-modal__info">
            Ao confirmar, registraremos que voce nao podera comparecer. Caso mude de ideia, voce pode confirmar sua presenca a qualquer momento.
          </p>
          <div class="rsvp-modal__actions">
            <button
              class="rsvp-modal__button rsvp-modal__button--secondary"
              @click="showDeclineModal = false"
              :disabled="cancelling"
            >
              Voltar
            </button>
            <button
              class="rsvp-modal__button rsvp-modal__button--danger"
              @click="declinePresence"
              :disabled="cancelling"
            >
              <span v-if="cancelling">Registrando...</span>
              <span v-else>Confirmar Ausencia</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Tela de Ausencia Registrada -->
      <div v-if="declined" class="rsvp-declined">
        <div class="rsvp-declined__card">
          <div class="rsvp-declined__icon">📝</div>
          <h2 class="rsvp-declined__title">Ausencia Registrada</h2>
          <p class="rsvp-declined__message">
            Registramos que voce nao podera comparecer ao casamento.
          </p>
          <p class="rsvp-declined__note">
            Sentiremos sua falta! Caso mude de ideia, voce pode confirmar sua presenca a qualquer momento.
          </p>

          <div class="rsvp-declined__actions">
            <button class="rsvp-declined__button" @click="reset">
              Voltar ao inicio
            </button>
            <router-link to="/" class="rsvp-declined__link">
              Ver Lista de Presentes →
            </router-link>
          </div>
        </div>
      </div>

      <!-- Link para lista de presentes -->
      <footer class="rsvp-footer">
        <router-link to="/" class="rsvp-footer__link">
          🎁 Ver Lista de Presentes
        </router-link>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { APP_CONFIG } from '@/utils/constants'
import rsvpService from '@/services/rsvp.service'
import qrcodeService from '@/services/qrcode.service'

// State
const code = ref('')
const guest = ref(null)
const loading = ref(false)
const confirming = ref(false)
const confirmed = ref(false)
const error = ref('')
const confirmationMessage = ref('')
const showCancelModal = ref(false)
const showDeclineModal = ref(false)
const cancelling = ref(false)
const declined = ref(false)

// QR Code state
const qrCodeDataUrl = ref('')
const qrCodeLoading = ref(false)
const emailSending = ref(false)
const emailSent = ref(false)
const emailError = ref('')
const guestEmail = ref('')

// Computed
const totalPeople = computed(() => {
  if (!guest.value) return 0
  const hasParceiro = guest.value.parceiro ? 1 : 0
  return 1 + hasParceiro + (parseInt(guest.value.acompanhantes) || 0)
})

const formattedWeddingDate = computed(() => {
  const date = new Date(APP_CONFIG.WEDDING_DATE + 'T12:00:00')
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
})

// Methods
const onCodeInput = (event) => {
  // Permite apenas dígitos
  code.value = event.target.value.replace(/\D/g, '')
}

const getFullCode = () => {
  return 'RE' + code.value.trim()
}

const checkCode = async () => {
  if (!code.value.trim()) return

  loading.value = true
  error.value = ''

  try {
    const result = await rsvpService.checkGuestCode(getFullCode())
    guest.value = result
  } catch (err) {
    error.value = err.message || 'Erro ao verificar codigo. Tente novamente.'
  } finally {
    loading.value = false
  }
}

const confirmPresence = async () => {
  if (!guest.value) return

  confirming.value = true
  error.value = ''

  try {
    const result = await rsvpService.confirmPresence(getFullCode())
    confirmationMessage.value = result.message
    confirmed.value = true

    console.log('gerar qrcode');
    
    await generateQRCode()
  } catch (err) {
    error.value = err.message || 'Erro ao confirmar presenca. Tente novamente.'
  } finally {
    confirming.value = false
  }
}

// QR Code Methods
const generateQRCode = async () => {
  qrCodeLoading.value = true
  try {
    
    qrCodeDataUrl.value = await qrcodeService.generateWeddingQRCode(getFullCode())
  } catch (err) {
    console.error('Erro ao gerar QR Code:', err)
  } finally {
    qrCodeLoading.value = false
  }
}

const downloadQRCode = () => {
  if (qrCodeDataUrl.value) {
    const guestName = guest.value?.nome || 'convidado'
    qrcodeService.downloadQRCode(qrCodeDataUrl.value, `qrcode-${guestName}.png`)
  }
}

const sendQRCodeByEmail = async () => {
  if (!guestEmail.value.trim()) {
    emailError.value = 'Digite um email valido'
    return
  }

  emailSending.value = true
  emailError.value = ''

  try {
    await rsvpService.sendQRCodeEmail({
      code: getFullCode(),
      email: guestEmail.value,
      name: guest.value?.nome || 'Convidado',
    })
    emailSent.value = true
  } catch (err) {
    emailError.value = err.message || 'Erro ao enviar email'
  } finally {
    emailSending.value = false
  }
}

const cancelPresence = async () => {
  if (!guest.value) return

  cancelling.value = true
  error.value = ''

  try {
    await rsvpService.cancelPresence(getFullCode())
    showCancelModal.value = false
    guest.value.confirmado = false
  } catch (err) {
    error.value = err.message || 'Erro ao cancelar presenca. Tente novamente.'
    showCancelModal.value = false
  } finally {
    cancelling.value = false
  }
}

const declinePresence = async () => {
  if (!guest.value) return

  cancelling.value = true
  error.value = ''

  try {
    await rsvpService.cancelPresence(getFullCode())
    showDeclineModal.value = false
    declined.value = true
  } catch (err) {
    error.value = err.message || 'Erro ao registrar ausencia. Tente novamente.'
    showDeclineModal.value = false
  } finally {
    cancelling.value = false
  }
}

const reset = () => {
  code.value = ''
  guest.value = null
  confirmed.value = false
  declined.value = false
  error.value = ''
  confirmationMessage.value = ''
  showCancelModal.value = false
  showDeclineModal.value = false
}
</script>

<style scoped>
.rsvp-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #FFF9F0 0%, #F5E6D3 100%);
  padding: 2rem 1rem;
}

.rsvp-container {
  width: 100%;
  max-width: 480px;
}

/* Header */
.rsvp-header {
  text-align: center;
  margin-bottom: 2rem;
}

.rsvp-header__icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.rsvp-header__title {
  font-size: 1.5rem;
  color: #3d2b1f;
  margin: 0 0 0.5rem;
  font-weight: 700;
}

.rsvp-header__subtitle {
  font-size: 1.1rem;
  color: #8B7355;
  margin: 0;
  font-style: italic;
}

/* Form */
.rsvp-form {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.rsvp-form__instruction {
  text-align: center;
  color: #5a4a3a;
  margin: 0 0 1.5rem;
  font-size: 0.95rem;
  line-height: 1.5;
}

.rsvp-form__input-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.rsvp-form__input-wrapper {
  display: flex;
  align-items: center;
  border: 2px solid #E8DCC8;
  border-radius: 0.5rem;
  background: #FFF9F0;
  overflow: hidden;
  transition: border-color 0.2s;
}

.rsvp-form__input-wrapper:focus-within {
  border-color: #D4A574;
}

.rsvp-form__prefix {
  padding: 1rem 0.5rem 1rem 1rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: #3d2b1f;
  background: #E8DCC8;
  user-select: none;
}

.rsvp-form__input {
  width: 100%;
  padding: 1rem;
  font-size: 1.1rem;
  text-align: center;
  text-transform: uppercase;
  border: 2px solid #E8DCC8;
  border-radius: 0.5rem;
  background: #FFF9F0;
  color: #3d2b1f;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.rsvp-form__input--with-prefix {
  border: none;
  border-radius: 0;
  text-align: left;
  padding-left: 0.5rem;
}

.rsvp-form__input--with-prefix:focus {
  outline: none;
}

.rsvp-form__input:focus {
  outline: none;
  border-color: #D4A574;
}

.rsvp-form__input::placeholder {
  text-transform: none;
  color: #8B7355;
}

.rsvp-form__button {
  width: 100%;
  padding: 1rem;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #8B3A3A 0%, #C45C5C 100%);
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.rsvp-form__button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 58, 58, 0.3);
}

.rsvp-form__button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.rsvp-form__error {
  margin: 1rem 0 0;
  padding: 0.75rem;
  background: #FEE2E2;
  color: #991B1B;
  border-radius: 0.5rem;
  text-align: center;
  font-size: 0.9rem;
}

/* Guest Card */
.rsvp-guest__card {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.rsvp-guest__icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.rsvp-guest__greeting {
  font-size: 1.3rem;
  color: #3d2b1f;
  margin: 0 0 1.5rem;
}

.rsvp-guest__details {
  background: #FFF9F0;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.rsvp-guest__detail {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #E8DCC8;
}

.rsvp-guest__detail:last-child {
  border-bottom: none;
}

.rsvp-guest__label {
  color: #8B7355;
  font-size: 0.9rem;
}

.rsvp-guest__value {
  color: #3d2b1f;
  font-weight: 600;
}

.rsvp-guest__already-confirmed {
  background: #D1FAE5;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1rem;
}

.rsvp-guest__check {
  font-size: 2rem;
}

.rsvp-guest__already-confirmed p {
  margin: 0.5rem 0 0;
  color: #065F46;
}

.rsvp-guest__cancel-link {
  background: none;
  border: none;
  color: #991B1B;
  cursor: pointer;
  font-size: 0.85rem;
  margin-top: 0.75rem;
  padding: 0.25rem;
  text-decoration: underline;
  transition: color 0.2s;
}

.rsvp-guest__cancel-link:hover {
  color: #7F1D1D;
}

.rsvp-guest__confirm-text {
  color: #5a4a3a;
  margin: 0 0 1rem;
}

.rsvp-guest__buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.rsvp-guest__confirm-button {
  width: 100%;
  padding: 1rem;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #2a9d8f 0%, #40E0D0 100%);
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.rsvp-guest__confirm-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(42, 157, 143, 0.3);
}

.rsvp-guest__confirm-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.rsvp-guest__decline-button {
  width: 100%;
  padding: 0.875rem;
  font-size: 0.95rem;
  font-weight: 500;
  color: #8B7355;
  background: #FFF9F0;
  border: 2px solid #E8DCC8;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.rsvp-guest__decline-button:hover:not(:disabled) {
  background: #E8DCC8;
  color: #5a4a3a;
}

.rsvp-guest__decline-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.rsvp-guest__back {
  background: none;
  border: none;
  color: #8B7355;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0.5rem;
}

.rsvp-guest__back:hover {
  color: #3d2b1f;
}

/* Success */
.rsvp-success__card {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.rsvp-success__icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.rsvp-success__title {
  font-size: 1.5rem;
  color: #2a9d8f;
  margin: 0 0 1rem;
}

.rsvp-success__message {
  color: #5a4a3a;
  margin: 0 0 1.5rem;
  font-size: 1.1rem;
}

.rsvp-success__see-you {
  color: #8B7355;
  margin: 0 0 0.5rem;
  font-style: italic;
}

.rsvp-success__date {
  color: #3d2b1f;
  font-weight: 600;
  margin: 0 0 2rem;
  font-size: 1.1rem;
}

.rsvp-success__actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.rsvp-success__button {
  padding: 0.75rem 1.5rem;
  font-size: 0.95rem;
  color: #8B7355;
  background: #FFF9F0;
  border: 2px solid #E8DCC8;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.rsvp-success__button:hover {
  background: #E8DCC8;
}

.rsvp-success__link {
  padding: 0.75rem 1.5rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #8B3A3A 0%, #C45C5C 100%);
  border-radius: 0.5rem;
  text-decoration: none;
  transition: all 0.2s;
}

.rsvp-success__link:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 58, 58, 0.3);
}

/* QR Code */
.rsvp-qrcode {
  background: #FFF9F0;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin: 1.5rem 0;
  border: 2px dashed #E8DCC8;
}

.rsvp-qrcode__title {
  font-size: 1.1rem;
  color: #3d2b1f;
  margin: 0 0 0.25rem;
  text-align: center;
}

.rsvp-qrcode__subtitle {
  font-size: 0.85rem;
  color: #8B7355;
  margin: 0 0 1rem;
  text-align: center;
}

.rsvp-qrcode__loading {
  text-align: center;
  padding: 2rem;
  color: #8B7355;
}

.rsvp-qrcode__image-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1rem;
}

.rsvp-qrcode__image {
  width: 200px;
  height: 200px;
  border-radius: 0.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.rsvp-qrcode__code {
  margin: 0.75rem 0 0;
  font-size: 1.2rem;
  font-weight: 700;
  color: #3d2b1f;
  font-family: monospace;
  letter-spacing: 0.1em;
}

.rsvp-qrcode__actions {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.rsvp-qrcode__download-btn {
  padding: 0.75rem 1.5rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #2a9d8f 0%, #40E0D0 100%);
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.rsvp-qrcode__download-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(42, 157, 143, 0.3);
}

.rsvp-qrcode__download-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.rsvp-qrcode__email {
  border-top: 1px solid #E8DCC8;
  padding-top: 1rem;
}

.rsvp-qrcode__email-label {
  font-size: 0.9rem;
  color: #5a4a3a;
  margin: 0 0 0.5rem;
  text-align: center;
}

.rsvp-qrcode__email-form {
  display: flex;
  gap: 0.5rem;
}

.rsvp-qrcode__email-input {
  flex: 1;
  padding: 0.75rem;
  font-size: 0.95rem;
  border: 2px solid #E8DCC8;
  border-radius: 0.5rem;
  background: white;
  color: #3d2b1f;
}

.rsvp-qrcode__email-input:focus {
  outline: none;
  border-color: #D4A574;
}

.rsvp-qrcode__email-btn {
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #8B3A3A 0%, #C45C5C 100%);
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.rsvp-qrcode__email-btn:hover:not(:disabled) {
  transform: translateY(-2px);
}

.rsvp-qrcode__email-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.rsvp-qrcode__email-error {
  margin: 0.5rem 0 0;
  padding: 0.5rem;
  background: #FEE2E2;
  color: #991B1B;
  border-radius: 0.25rem;
  font-size: 0.85rem;
  text-align: center;
}

.rsvp-qrcode__email-success {
  text-align: center;
  padding: 0.75rem;
  background: #D1FAE5;
  color: #065F46;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  border-top: 1px solid #E8DCC8;
  margin-top: 1rem;
}

/* Declined */
.rsvp-declined__card {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.rsvp-declined__icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.rsvp-declined__title {
  font-size: 1.5rem;
  color: #8B7355;
  margin: 0 0 1rem;
}

.rsvp-declined__message {
  color: #5a4a3a;
  margin: 0 0 1rem;
  font-size: 1.1rem;
}

.rsvp-declined__note {
  color: #8B7355;
  margin: 0 0 2rem;
  font-size: 0.95rem;
  font-style: italic;
}

.rsvp-declined__actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.rsvp-declined__button {
  padding: 0.75rem 1.5rem;
  font-size: 0.95rem;
  color: #8B7355;
  background: #FFF9F0;
  border: 2px solid #E8DCC8;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.rsvp-declined__button:hover {
  background: #E8DCC8;
}

.rsvp-declined__link {
  padding: 0.75rem 1.5rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #8B3A3A 0%, #C45C5C 100%);
  border-radius: 0.5rem;
  text-decoration: none;
  transition: all 0.2s;
}

.rsvp-declined__link:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 58, 58, 0.3);
}

/* Footer */
.rsvp-footer {
  text-align: center;
  margin-top: 2rem;
}

.rsvp-footer__link {
  color: #8B7355;
  text-decoration: none;
  font-size: 0.95rem;
  transition: color 0.2s;
}

.rsvp-footer__link:hover {
  color: #3d2b1f;
}

/* Modal */
.rsvp-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.rsvp-modal {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  max-width: 400px;
  width: 100%;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  animation: modalSlideIn 0.2s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.rsvp-modal__icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.rsvp-modal__title {
  font-size: 1.3rem;
  color: #3d2b1f;
  margin: 0 0 1rem;
}

.rsvp-modal__message {
  color: #5a4a3a;
  margin: 0 0 0.75rem;
  font-size: 1rem;
  line-height: 1.5;
}

.rsvp-modal__warning {
  color: #991B1B;
  background: #FEE2E2;
  padding: 0.75rem;
  border-radius: 0.5rem;
  margin: 0 0 1.5rem;
  font-size: 0.9rem;
  line-height: 1.4;
}

.rsvp-modal__info {
  color: #5a4a3a;
  background: #FFF9F0;
  padding: 0.75rem;
  border-radius: 0.5rem;
  margin: 0 0 1.5rem;
  font-size: 0.9rem;
  line-height: 1.4;
}

.rsvp-modal__actions {
  display: flex;
  gap: 1rem;
}

.rsvp-modal__button {
  flex: 1;
  padding: 0.875rem 1rem;
  font-size: 0.95rem;
  font-weight: 600;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.rsvp-modal__button--secondary {
  background: #FFF9F0;
  color: #8B7355;
  border: 2px solid #E8DCC8;
}

.rsvp-modal__button--secondary:hover:not(:disabled) {
  background: #E8DCC8;
}

.rsvp-modal__button--danger {
  background: linear-gradient(135deg, #991B1B 0%, #DC2626 100%);
  color: white;
}

.rsvp-modal__button--danger:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(153, 27, 27, 0.3);
}

.rsvp-modal__button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 480px) {
  .rsvp-page {
    padding: 1rem;
  }

  .rsvp-form,
  .rsvp-guest__card,
  .rsvp-success__card {
    padding: 1.5rem;
  }

  .rsvp-header__title {
    font-size: 1.3rem;
  }
}
</style>
