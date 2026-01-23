<template>
  <div class="checkin-page">
    <div class="checkin-container">
      <!-- Header -->
      <header class="checkin-header">
        <div class="checkin-header__icon">🎟️</div>
        <h1 class="checkin-header__title">Check-in do Evento</h1>
        <p class="checkin-header__subtitle">
          {{ APP_CONFIG.BRIDE_NAME }} & {{ APP_CONFIG.GROOM_NAME }}
        </p>
      </header>

      <!-- Tela de PIN -->
      <div v-if="!authenticated" class="checkin-auth">
        <div class="checkin-auth__card">
          <div class="checkin-auth__icon">🔐</div>
          <h2 class="checkin-auth__title">Area Restrita</h2>
          <p class="checkin-auth__message">
            Digite o PIN de acesso para continuar
          </p>

          <div class="checkin-auth__input-group">
            <input
              v-model="pin"
              type="password"
              class="checkin-auth__input"
              placeholder="Digite o PIN"
              maxlength="10"
              @keyup.enter="validatePin"
            />
            <button
              class="checkin-auth__button"
              :disabled="!pin.trim()"
              @click="validatePin"
            >
              Acessar
            </button>
          </div>

          <p v-if="authError" class="checkin-auth__error">
            {{ authError }}
          </p>
        </div>
      </div>

      <!-- Area de Check-in -->
      <div v-else class="checkin-main">
        <!-- Estatisticas -->
        <div class="checkin-stats">
          <div class="checkin-stats__item">
            <span class="checkin-stats__number">{{ checkedInCount }}</span>
            <span class="checkin-stats__label">Check-ins realizados</span>
          </div>
        </div>

        <!-- Form de busca -->
        <div class="checkin-form">
          <p class="checkin-form__instruction">
            Digite ou escaneie o codigo do convidado
          </p>

          <div class="checkin-form__input-group">
            <div class="checkin-form__input-wrapper">
              <span class="checkin-form__prefix">RE:</span>
              <input
                ref="codeInput"
                v-model="code"
                type="text"
                class="checkin-form__input"
                placeholder="00"
                :disabled="loading"
                @input="onCodeInput"
                @keyup.enter="checkGuest"
              />
            </div>
            <button
              class="checkin-form__button"
              :disabled="loading || !code.trim()"
              @click="checkGuest"
            >
              <span v-if="loading">Buscando...</span>
              <span v-else>Buscar</span>
            </button>
          </div>

          <!-- Botao de Scanner -->
          <button
            class="checkin-form__scan-button"
            :disabled="loading || scanning"
            @click="openScanner"
          >
            📷 Escanear Codigo
          </button>

          <p v-if="error" class="checkin-form__error">
            {{ error }}
          </p>
        </div>

        <!-- Dados do convidado -->
        <div v-if="guest" class="checkin-guest">
          <div class="checkin-guest__card">
            <div class="checkin-guest__header">
              <span class="checkin-guest__icon">👤</span>
              <h3 class="checkin-guest__name">
                {{ guest.nome }}{{ guest.parceiro ? ` e ${guest.parceiro}` : '' }}
              </h3>
            </div>

            <div class="checkin-guest__details">
              <div class="checkin-guest__detail">
                <span class="checkin-guest__label">Codigo:</span>
                <span class="checkin-guest__value">{{ guest.codigo }}</span>
              </div>
              <div class="checkin-guest__detail">
                <span class="checkin-guest__label">Total de pessoas:</span>
                <span class="checkin-guest__value">{{ totalPeople }}</span>
              </div>
              <div class="checkin-guest__detail">
                <span class="checkin-guest__label">RSVP:</span>
                <span
                  class="checkin-guest__value"
                  :class="guest.confirmado ? 'checkin-guest__value--confirmed' : 'checkin-guest__value--pending'"
                >
                  {{ guest.confirmado ? 'Confirmado' : 'Nao confirmado' }}
                </span>
              </div>
              <div class="checkin-guest__detail">
                <span class="checkin-guest__label">Check-in:</span>
                <span
                  class="checkin-guest__value"
                  :class="guest.entrada_confirmada ? 'checkin-guest__value--confirmed' : 'checkin-guest__value--pending'"
                >
                  {{ guest.entrada_confirmada ? 'Realizado' : 'Pendente' }}
                </span>
              </div>
            </div>

            <div v-if="guest.entrada_confirmada" class="checkin-guest__already">
              <span class="checkin-guest__already-icon">✅</span>
              <p>Check-in ja realizado{{ guest.horario_entrada ? ` as ${guest.horario_entrada}` : '' }}</p>
            </div>

            <div v-else class="checkin-guest__actions">
              <button
                class="checkin-guest__checkin-button"
                :disabled="checkingIn"
                @click="performCheckin"
              >
                <span v-if="checkingIn">Registrando...</span>
                <span v-else>Registrar Entrada</span>
              </button>
            </div>

            <button class="checkin-guest__new" @click="resetGuest">
              Novo Check-in
            </button>
          </div>
        </div>

        <!-- Sucesso do check-in -->
        <div v-if="checkinSuccess" class="checkin-success">
          <div class="checkin-success__card">
            <div class="checkin-success__icon">🎉</div>
            <h3 class="checkin-success__title">Check-in Realizado!</h3>
            <p class="checkin-success__message">
              {{ lastCheckedInGuest }} entrou no evento
            </p>
            <button class="checkin-success__button" @click="resetAll">
              Proximo Check-in
            </button>
          </div>
        </div>

        <!-- Botao de sair -->
        <button class="checkin-logout" @click="logout">
          🚪 Sair da area restrita
        </button>
      </div>

      <!-- Modal do Scanner QR Code -->
      <div v-if="showScanner" class="scanner-modal">
        <div class="scanner-modal__content">
          <div class="scanner-modal__header">
            <h3 class="scanner-modal__title">Escanear QR Code</h3>
            <button class="scanner-modal__close" @click="closeScanner">✕</button>
          </div>

          <div class="scanner-modal__body">
            <!-- Container do QR Scanner -->
            <div id="qr-reader" class="qr-reader"></div>

            <!-- Status do Scanner -->
            <div v-if="scannerStatus && !scannedCode" class="scanner-status">
              <div class="scanner-status__spinner"></div>
              <span>{{ scannerStatus }}</span>
            </div>

            <!-- Resultado do Scan -->
            <div v-if="scannedCode" class="scanner-result">
              <p class="scanner-result__label">QR Code detectado:</p>
              <p class="scanner-result__code">{{ scannedCode }}</p>
            </div>

            <!-- Acoes -->
            <div class="scanner-actions">
              <button
                v-if="scannedCode"
                class="scanner-actions__use"
                @click="useScannedCode"
              >
                Fazer Check-in
              </button>

              <button
                v-if="scannedCode"
                class="scanner-actions__retry"
                @click="retryScanner"
              >
                Escanear outro
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onBeforeUnmount, watch } from 'vue'
import { APP_CONFIG } from '@/utils/constants'
import rsvpService from '@/services/rsvp.service'
import { Html5Qrcode } from 'html5-qrcode'
import type { Guest } from '@/types'
import { useAuthPin } from '@/composables/useAuthPin'

// Auth state (from composable)
const {
  authenticated,
  pin,
  authError,
  validatePin: validatePinFromComposable,
  logout: logoutFromComposable,
} = useAuthPin()

// Check-in state
const code = ref('')
const guest = ref<Guest | null>(null)
const loading = ref(false)
const checkingIn = ref(false)
const error = ref('')
const checkinSuccess = ref(false)
const lastCheckedInGuest = ref('')
const checkedInCount = ref(0)
const codeInput = ref<HTMLInputElement | null>(null)

// Scanner state
const showScanner = ref(false)
const scanning = ref(false)
const scannerStatus = ref('')
const scannedCode = ref('')
let html5QrCode: Html5Qrcode | null = null

// Computed
const totalPeople = computed(() => {
  if (!guest.value) return 0
  const hasParceiro = guest.value.parceiro ? 1 : 0
  return 1 + hasParceiro + (Number(guest.value.acompanhantes) || 0)
})

// Carrega contagem de check-ins do Supabase
const loadCheckinCount = async (): Promise<void> => {
  try {
    checkedInCount.value = await rsvpService.getCheckinCount()
  } catch (err) {
    console.error('Erro ao carregar contagem de check-ins:', err)
  }
}

// Carrega a contagem quando autenticado
watch(
  authenticated,
  async (isAuthenticated) => {
    if (isAuthenticated) {
      await loadCheckinCount()
    }
  },
  { immediate: true }
)

// Methods
const validatePin = async (): Promise<void> => {
  await validatePinFromComposable()
  if (authenticated.value) {
    nextTick(() => {
      codeInput.value?.focus()
    })
  }
}

const onCodeInput = (event: Event): void => {
  const target = event.target as HTMLInputElement
  code.value = target.value.replace(/\D/g, '')
}

const getFullCode = (): string => {
  return 'RE' + code.value.trim()
}

const checkGuest = async (): Promise<void> => {
  if (!code.value.trim()) return

  loading.value = true
  error.value = ''
  guest.value = null
  checkinSuccess.value = false

  try {
    const result = await rsvpService.checkGuestCode(getFullCode())
    guest.value = result
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Codigo nao encontrado'
  } finally {
    loading.value = false
  }
}

const performCheckin = async (): Promise<void> => {
  if (!guest.value) return

  checkingIn.value = true
  error.value = ''

  try {
    await rsvpService.registerCheckin(getFullCode())
    lastCheckedInGuest.value =
      guest.value.nome + (guest.value.parceiro ? ` e ${guest.value.parceiro}` : '')
    checkinSuccess.value = true
    guest.value = null
    await loadCheckinCount()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Erro ao registrar check-in'
  } finally {
    checkingIn.value = false
  }
}

const resetGuest = (): void => {
  guest.value = null
  code.value = ''
  error.value = ''
  checkinSuccess.value = false
  nextTick(() => {
    codeInput.value?.focus()
  })
}

const resetAll = (): void => {
  resetGuest()
}

const logout = (): void => {
  logoutFromComposable()
  resetGuest()
  checkedInCount.value = 0
}

// Scanner Methods
const openScanner = async (): Promise<void> => {
  showScanner.value = true
  scannedCode.value = ''
  scannerStatus.value = 'Iniciando camera...'
  error.value = ''

  await nextTick()

  try {
    html5QrCode = new Html5Qrcode('qr-reader')

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
    }

    await html5QrCode.start(
      { facingMode: 'environment' },
      config,
      onQrCodeSuccess,
      onQrCodeError
    )

    scannerStatus.value = 'Aponte para o QR Code'
    scanning.value = true
  } catch (err) {
    console.error('Erro ao iniciar scanner:', err)
    error.value = 'Nao foi possivel acessar a camera. Verifique as permissoes.'
    showScanner.value = false
    scannerStatus.value = ''
  }
}

const onQrCodeSuccess = (decodedText: string): void => {
  scanning.value = false
  scannerStatus.value = ''

  const extractedCode = extractCodeFromQR(decodedText)

  if (extractedCode) {
    scannedCode.value = extractedCode
  } else {
    error.value = 'QR Code invalido. Certifique-se de usar o QR Code do convite.'
    setTimeout(() => {
      error.value = ''
      scanning.value = true
    }, 2000)
  }
}

const onQrCodeError = (): void => {
  // Silenciamente ignora erros de leitura
}

const extractCodeFromQR = (text: string): string | null => {
  const cleanText = text.trim().toUpperCase()

  const match = cleanText.match(/RE\s*[-:]?\s*([0-9A-Z]{1,10})/i)
  if (match) {
    return match[0]
  }

  if (cleanText.startsWith('RE')) {
    return cleanText
  }

  if (/^\d{1,4}$/.test(cleanText)) {
    return 'RE' + cleanText
  }

  return null
}

const closeScanner = async (): Promise<void> => {
  await stopScanner()
  showScanner.value = false
  scannedCode.value = ''
  scannerStatus.value = ''
}

const stopScanner = async (): Promise<void> => {
  if (html5QrCode) {
    try {
      await html5QrCode.stop()
      html5QrCode.clear()
    } catch (err) {
      console.error('Erro ao parar scanner:', err)
    }
    html5QrCode = null
  }
  scanning.value = false
}

const useScannedCode = async (): Promise<void> => {
  if (scannedCode.value) {
    const numericPart = scannedCode.value.replace(/^RE/i, '')
    code.value = numericPart
    await closeScanner()
    nextTick(() => {
      checkGuest()
    })
  }
}

const retryScanner = async (): Promise<void> => {
  scannedCode.value = ''
  error.value = ''

  if (!scanning.value && html5QrCode) {
    try {
      scanning.value = true
      scannerStatus.value = 'Aponte para o QR Code'
    } catch (err) {
      console.error('Erro ao reiniciar scanner:', err)
    }
  }
}

onBeforeUnmount(() => {
  stopScanner()
})
</script>

<style scoped>
.checkin-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  padding: 2rem 1rem;
}

.checkin-container {
  width: 100%;
  max-width: 500px;
}

/* Header */
.checkin-header {
  text-align: center;
  margin-bottom: 2rem;
}

.checkin-header__icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.checkin-header__title {
  font-size: 1.5rem;
  color: #ffffff;
  margin: 0 0 0.5rem;
  font-weight: 700;
}

.checkin-header__subtitle {
  font-size: 1rem;
  color: #a0aec0;
  margin: 0;
  font-style: italic;
}

/* Auth */
.checkin-auth__card {
  background: #ffffff;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  text-align: center;
}

.checkin-auth__icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.checkin-auth__title {
  font-size: 1.3rem;
  color: #1a1a2e;
  margin: 0 0 0.5rem;
}

.checkin-auth__message {
  color: #64748b;
  margin: 0 0 1.5rem;
  font-size: 0.95rem;
}

.checkin-auth__input-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.checkin-auth__input {
  width: 100%;
  padding: 1rem;
  font-size: 1.2rem;
  text-align: center;
  letter-spacing: 0.3em;
  border: 2px solid #e2e8f0;
  border-radius: 0.5rem;
  background: #f8fafc;
  color: #1a1a2e;
  box-sizing: border-box;
}

.checkin-auth__input:focus {
  outline: none;
  border-color: #3b82f6;
}

.checkin-auth__button {
  width: 100%;
  padding: 1rem;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.checkin-auth__button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.checkin-auth__button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.checkin-auth__error {
  margin: 1rem 0 0;
  padding: 0.75rem;
  background: #fef2f2;
  color: #dc2626;
  border-radius: 0.5rem;
  font-size: 0.9rem;
}

/* Stats */
.checkin-stats {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.checkin-stats__item {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  padding: 1rem 2rem;
  text-align: center;
}

.checkin-stats__number {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: #10b981;
}

.checkin-stats__label {
  font-size: 0.85rem;
  color: #a0aec0;
}

/* Form */
.checkin-form {
  background: #ffffff;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  margin-bottom: 1rem;
}

.checkin-form__instruction {
  text-align: center;
  color: #64748b;
  margin: 0 0 1rem;
  font-size: 0.9rem;
}

.checkin-form__input-group {
  display: flex;
  gap: 0.75rem;
}

.checkin-form__input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  border: 2px solid #e2e8f0;
  border-radius: 0.5rem;
  background: #f8fafc;
  overflow: hidden;
}

.checkin-form__input-wrapper:focus-within {
  border-color: #3b82f6;
}

.checkin-form__prefix {
  padding: 0.75rem 0.5rem 0.75rem 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a2e;
  background: #e2e8f0;
}

.checkin-form__input {
  flex: 1;
  padding: 0.75rem;
  font-size: 1rem;
  border: none;
  background: transparent;
  color: #1a1a2e;
}

.checkin-form__input:focus {
  outline: none;
}

.checkin-form__button {
  padding: 0.75rem 1.5rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.checkin-form__button:hover:not(:disabled) {
  transform: translateY(-2px);
}

.checkin-form__button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.checkin-form__error {
  margin: 1rem 0 0;
  padding: 0.75rem;
  background: #fef2f2;
  color: #dc2626;
  border-radius: 0.5rem;
  text-align: center;
  font-size: 0.9rem;
}

.checkin-form__scan-button {
  width: 100%;
  padding: 0.875rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: #ffffff;
  background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 0.75rem;
}

.checkin-form__scan-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
}

.checkin-form__scan-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Guest Card */
.checkin-guest__card {
  background: #ffffff;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  margin-bottom: 1rem;
}

.checkin-guest__header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.checkin-guest__icon {
  font-size: 2rem;
}

.checkin-guest__name {
  font-size: 1.1rem;
  color: #1a1a2e;
  margin: 0;
  font-weight: 600;
}

.checkin-guest__details {
  margin-bottom: 1rem;
}

.checkin-guest__detail {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f1f5f9;
}

.checkin-guest__detail:last-child {
  border-bottom: none;
}

.checkin-guest__label {
  color: #64748b;
  font-size: 0.9rem;
}

.checkin-guest__value {
  color: #1a1a2e;
  font-weight: 600;
  font-size: 0.9rem;
}

.checkin-guest__value--confirmed {
  color: #10b981;
}

.checkin-guest__value--pending {
  color: #f59e0b;
}

.checkin-guest__already {
  background: #d1fae5;
  border-radius: 0.5rem;
  padding: 1rem;
  text-align: center;
  margin-bottom: 1rem;
}

.checkin-guest__already-icon {
  font-size: 1.5rem;
}

.checkin-guest__already p {
  margin: 0.5rem 0 0;
  color: #065f46;
  font-size: 0.9rem;
}

.checkin-guest__checkin-button {
  width: 100%;
  padding: 1rem;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 0.75rem;
}

.checkin-guest__checkin-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.checkin-guest__checkin-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.checkin-guest__new {
  width: 100%;
  padding: 0.75rem;
  font-size: 0.9rem;
  color: #64748b;
  background: #f1f5f9;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.checkin-guest__new:hover {
  background: #e2e8f0;
  color: #1a1a2e;
}

/* Success */
.checkin-success__card {
  background: #d1fae5;
  border-radius: 1rem;
  padding: 2rem;
  text-align: center;
  margin-bottom: 1rem;
  animation: successPulse 0.5s ease-out;
}

@keyframes successPulse {
  0% {
    transform: scale(0.95);
    opacity: 0;
  }
  50% {
    transform: scale(1.02);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.checkin-success__icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.checkin-success__title {
  font-size: 1.3rem;
  color: #065f46;
  margin: 0 0 0.5rem;
}

.checkin-success__message {
  color: #047857;
  margin: 0 0 1.5rem;
  font-size: 1rem;
}

.checkin-success__button {
  padding: 0.875rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.checkin-success__button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

/* Logout */
.checkin-logout {
  display: block;
  width: 100%;
  padding: 0.75rem;
  font-size: 0.9rem;
  color: #94a3b8;
  background: transparent;
  border: 1px solid #475569;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 1rem;
}

.checkin-logout:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
  border-color: #64748b;
}

/* Scanner Modal */
.scanner-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.scanner-modal__content {
  background: #1a1a2e;
  border-radius: 1rem;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.scanner-modal__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #2d2d44;
}

.scanner-modal__title {
  color: #ffffff;
  margin: 0;
  font-size: 1.1rem;
}

.scanner-modal__close {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.25rem;
  line-height: 1;
}

.scanner-modal__close:hover {
  color: #ffffff;
}

.scanner-modal__body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.qr-reader {
  width: 100%;
  border-radius: 0.5rem;
  overflow: hidden;
}

.qr-reader video {
  border-radius: 0.5rem;
}

/* Estilos para o html5-qrcode */
#qr-reader__scan_region {
  background: #000 !important;
}

#qr-reader__dashboard {
  padding: 0 !important;
}

#qr-reader__dashboard_section_swaplink {
  display: none !important;
}

.scanner-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #2d2d44;
  border-radius: 0.5rem;
  color: #a0aec0;
}

.scanner-status__spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #3b82f6;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.scanner-result {
  padding: 1rem;
  background: #d1fae5;
  border-radius: 0.5rem;
  text-align: center;
}

.scanner-result__label {
  color: #065f46;
  margin: 0 0 0.5rem;
  font-size: 0.9rem;
}

.scanner-result__code {
  color: #047857;
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  font-family: monospace;
}

.scanner-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.scanner-actions__use {
  width: 100%;
  padding: 1rem;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.scanner-actions__use:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.scanner-actions__retry {
  width: 100%;
  padding: 0.75rem;
  font-size: 0.9rem;
  color: #94a3b8;
  background: #2d2d44;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.scanner-actions__retry:hover {
  background: #3d3d5c;
  color: #ffffff;
}

/* Responsive */
@media (max-width: 480px) {
  .checkin-page {
    padding: 1rem;
  }

  .checkin-form__input-group {
    flex-direction: column;
  }

  .checkin-form__button {
    width: 100%;
  }

  .scanner-modal__content {
    max-height: 95vh;
  }
}
</style>
