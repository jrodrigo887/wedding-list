<template>
  <div class="photo-feed-view">
    <div class="photo-feed-view__container">
      <!-- Header -->
      <header class="photo-feed-view__header">
        <div class="photo-feed-view__title-section">
          <h1 class="photo-feed-view__title">Galeria de Fotos</h1>
          <p class="photo-feed-view__subtitle">
            Momentos especiais do nosso grande dia
          </p>
        </div>

        <!-- Identificação -->
        <div v-if="!isIdentified" class="photo-feed-view__identify">
          <p class="photo-feed-view__identify-text">
            Identifique-se para curtir, comentar e enviar fotos
          </p>
          <div class="photo-feed-view__identify-form">
            <div class="photo-feed-view__input-group">
              <span class="photo-feed-view__prefix">RE:</span>
              <input
                v-model="guestCode"
                type="text"
                class="photo-feed-view__input"
                placeholder="00"
                maxlength="10"
                @keyup.enter="handleIdentify"
              />
            </div>
            <button
              class="photo-feed-view__btn photo-feed-view__btn--identify"
              :disabled="identifying"
              @click="handleIdentify"
            >
              {{ identifying ? 'Verificando...' : 'Entrar' }}
            </button>
          </div>
          <p v-if="identifyError" class="photo-feed-view__error">
            {{ identifyError }}
          </p>
        </div>

        <!-- Usuário identificado -->
        <div v-else class="photo-feed-view__user">
          <span class="photo-feed-view__welcome">
            Olá, <strong>{{ store.currentGuestName }}</strong
            >!
          </span>
          <div class="photo-feed-view__user-actions">
            <button
              class="photo-feed-view__btn photo-feed-view__btn--upload"
              @click="goToUpload"
            >
              📷 Enviar Foto
            </button>
            <button
              class="photo-feed-view__btn photo-feed-view__btn--logout"
              @click="handleLogout"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <!-- Feed -->
      <main class="photo-feed-view__main">
        <PhotoFeed @view="handleViewPhoto" />
      </main>

      <!-- Modal -->
      <PhotoModal :photo="selectedPhoto" @close="handleCloseModal" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '@/services/supabase';
import { usePhotosStore } from '../../infrastructure/stores';
import { PhotoFeed, PhotoModal } from '../components';
import type { Photo } from '../../domain/entities';

/**
 * View: PhotoFeedView
 * Página pública do feed de fotos
 */

const router = useRouter();
const store = usePhotosStore();

const guestCode = ref('');
const guestName = ref('');
const isIdentified = ref(false);
const identifying = ref(false);
const identifyError = ref('');
const selectedPhoto = ref<Photo | null>(null);

onMounted(async () => {
  // Tenta recuperar identificação salva
  const savedCode = localStorage.getItem('photo_guest_code');
  const savedName = localStorage.getItem('photo_guest_name');

  if (savedCode && savedName) {
    store.setGuestContext(savedCode, savedName);
    isIdentified.value = true;
    await store.fetchGuestPhotoCount();
  }

  await store.fetchApprovedPhotos();
});

const getFullCode = () => {
  return 'RE' + guestCode.value.trim();
};

const handleIdentify = async () => {
  if (!guestCode.value.trim()) {
    identifyError.value = 'Digite seu código';
    return;
  }

  identifying.value = true;
  identifyError.value = '';

  try {
    // Busca convidado pelo código
    const { data, error } = await supabase
      .from('convidados')
      .select('codigo, nome')
      .ilike('codigo', getFullCode())
      .single();

    if (error || !data) {
      identifyError.value = 'Código não encontrado';
      return;
    }

    // Salva identificação
    store.setGuestContext(data.codigo, data.nome);
    localStorage.setItem('photo_guest_code', data.codigo);
    localStorage.setItem('photo_guest_name', data.nome);
    guestName.value = data.nome;
    isIdentified.value = true;

    await store.fetchGuestPhotoCount();
    await store.fetchApprovedPhotos(true);
  } catch {
    identifyError.value = 'Erro ao verificar código';
  } finally {
    identifying.value = false;
  }
};

const handleLogout = () => {
  store.clearGuestContext();
  localStorage.removeItem('photo_guest_code');
  localStorage.removeItem('photo_guest_name');
  isIdentified.value = false;
  guestCode.value = '';
  guestName.value = '';
};

const goToUpload = () => {
  router.push('/fotos/enviar');
};

const handleViewPhoto = (photo: Photo) => {
  selectedPhoto.value = photo;
};

const handleCloseModal = () => {
  selectedPhoto.value = null;
};
</script>

<style scoped>
.photo-feed-view {
  min-height: 100vh;
  background: #faf9f7;
  padding: 0;
}

.photo-feed-view__container {
  max-width: 960px;
  margin: 0 auto;
  padding: 0 1.25rem;
}

.photo-feed-view__header {
  text-align: center;
  padding: 3rem 0 2rem;
}

.photo-feed-view__title-section {
  margin-bottom: 1.75rem;
}

.photo-feed-view__title {
  font-family: 'Playfair Display', serif;
  font-size: 2rem;
  font-weight: 600;
  color: #2d2420;
  margin: 0 0 0.375rem 0;
  letter-spacing: -0.01em;
}

.photo-feed-view__subtitle {
  font-size: 0.9375rem;
  color: #9ca3af;
  margin: 0;
  font-weight: 400;
  letter-spacing: 0.01em;
}

.photo-feed-view__identify {
  max-width: 380px;
  margin: 0 auto;
  padding: 1.5rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.photo-feed-view__identify-text {
  font-size: 0.8125rem;
  color: #9ca3af;
  margin: 0 0 1rem 0;
}

.photo-feed-view__identify-form {
  display: flex;
  gap: 0.625rem;
}

.photo-feed-view__input-group {
  flex: 1;
  display: flex;
  align-items: center;
  background: #fafafa;
  border: 1px solid #e5e7eb;
  border-radius: 0.625rem;
  overflow: hidden;
  transition: border-color 0.2s;
}

.photo-feed-view__input-group:focus-within {
  border-color: #d4a574;
}

.photo-feed-view__prefix {
  padding: 0 0.75rem;
  font-weight: 600;
  font-size: 0.875rem;
  color: #9ca3af;
  background: transparent;
}

.photo-feed-view__input {
  flex: 1;
  padding: 0.6875rem 0.75rem 0.6875rem 0;
  border: none;
  background: transparent;
  font-size: 0.9375rem;
  outline: none;
  color: #374151;
}

.photo-feed-view__input::placeholder {
  color: #d1d5db;
}

.photo-feed-view__btn {
  padding: 0.6875rem 1.25rem;
  border: none;
  border-radius: 0.625rem;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  letter-spacing: 0.01em;
}

.photo-feed-view__btn--identify {
  background: linear-gradient(135deg, #d4a574 0%, #c49a6c 100%);
  color: white;
  box-shadow: 0 2px 6px rgba(212, 165, 116, 0.25);
}

.photo-feed-view__btn--identify:hover:not(:disabled) {
  box-shadow: 0 3px 10px rgba(212, 165, 116, 0.35);
  transform: translateY(-1px);
}

.photo-feed-view__btn--identify:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.photo-feed-view__error {
  margin-top: 0.75rem;
  font-size: 0.8125rem;
  color: #dc2626;
}

.photo-feed-view__user {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.25rem;
  flex-wrap: wrap;
}

.photo-feed-view__welcome {
  font-size: 0.9375rem;
  color: #6b7280;
}

.photo-feed-view__welcome strong {
  color: #374151;
}

.photo-feed-view__user-actions {
  display: flex;
  gap: 0.5rem;
}

.photo-feed-view__btn--upload {
  background: linear-gradient(135deg, #d4a574 0%, #c49a6c 100%);
  color: white;
  box-shadow: 0 2px 6px rgba(212, 165, 116, 0.25);
}

.photo-feed-view__btn--upload:hover {
  box-shadow: 0 3px 10px rgba(212, 165, 116, 0.35);
  transform: translateY(-1px);
}

.photo-feed-view__btn--logout {
  background: transparent;
  color: #9ca3af;
  border: 1px solid #e5e7eb;
}

.photo-feed-view__btn--logout:hover {
  background: #f9fafb;
  color: #6b7280;
}

.photo-feed-view__main {
  padding-bottom: 3rem;
}

@media (max-width: 640px) {
  .photo-feed-view__header {
    padding: 2rem 0 1.5rem;
  }

  .photo-feed-view__title {
    font-size: 1.625rem;
  }

  .photo-feed-view__identify-form {
    flex-direction: column;
  }

  .photo-feed-view__user {
    flex-direction: column;
    gap: 0.75rem;
  }

  .photo-feed-view__user-actions {
    width: 100%;
  }

  .photo-feed-view__btn {
    flex: 1;
  }
}
</style>
