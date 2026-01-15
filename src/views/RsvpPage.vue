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
      <div v-if="!guest && !confirmed" class="rsvp-form">
        <p class="rsvp-form__instruction">
          Digite o codigo que esta no seu convite para confirmar sua presenca
        </p>

        <div class="rsvp-form__input-group">
          <input
            v-model="code"
            type="text"
            class="rsvp-form__input"
            placeholder="Digite seu codigo (ex: ABC123)"
            :disabled="loading"
            @keyup.enter="checkCode"
          />
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
      <div v-if="guest && !confirmed" class="rsvp-guest">
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
          </div>

          <div v-else class="rsvp-guest__actions">
            <p class="rsvp-guest__confirm-text">
              Deseja confirmar sua presenca no casamento?
            </p>
            <button
              class="rsvp-guest__confirm-button"
              :disabled="confirming"
              @click="confirmPresence"
            >
              <span v-if="confirming">Confirmando...</span>
              <span v-else>Confirmar Presenca</span>
            </button>
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

// State
const code = ref('')
const guest = ref(null)
const loading = ref(false)
const confirming = ref(false)
const confirmed = ref(false)
const error = ref('')
const confirmationMessage = ref('')

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
const checkCode = async () => {
  if (!code.value.trim()) return

  loading.value = true
  error.value = ''

  try {
    const result = await rsvpService.checkGuestCode(code.value.trim())
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
    const result = await rsvpService.confirmPresence(code.value.trim())
    confirmationMessage.value = result.message
    confirmed.value = true
  } catch (err) {
    error.value = err.message || 'Erro ao confirmar presenca. Tente novamente.'
  } finally {
    confirming.value = false
  }
}

const reset = () => {
  code.value = ''
  guest.value = null
  confirmed.value = false
  error.value = ''
  confirmationMessage.value = ''
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

.rsvp-guest__confirm-text {
  color: #5a4a3a;
  margin: 0 0 1rem;
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
  margin-bottom: 1rem;
}

.rsvp-guest__confirm-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(42, 157, 143, 0.3);
}

.rsvp-guest__confirm-button:disabled {
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
