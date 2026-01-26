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

<style scoped>
.photo-feed-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #fefdfb 0%, #faf4e8 50%, #f5ebd7 100%);
  padding: 2rem 1rem;
}

.photo-feed-view__container {
  max-width: 1200px;
  margin: 0 auto;
}

.photo-feed-view__header {
  text-align: center;
  margin-bottom: 2rem;
}

.photo-feed-view__title {
  font-family: 'Playfair Display', serif;
  font-size: 2.5rem;
  color: #3d2b1f;
  margin: 0 0 0.5rem 0;
}

.photo-feed-view__subtitle {
  font-size: 1rem;
  color: #6b7280;
  margin: 0 0 1.5rem 0;
}

.photo-feed-view__identify {
  max-width: 400px;
  margin: 0 auto;
  padding: 1.5rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.photo-feed-view__identify-text {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 1rem 0;
}

.photo-feed-view__identify-form {
  display: flex;
  gap: 0.75rem;
}

.photo-feed-view__input-group {
  flex: 1;
  display: flex;
  align-items: center;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
}

.photo-feed-view__prefix {
  padding: 0 0.75rem;
  font-weight: 600;
  color: #6b7280;
  background: #f3f4f6;
}

.photo-feed-view__input {
  flex: 1;
  padding: 0.75rem;
  border: none;
  background: transparent;
  font-size: 1rem;
  outline: none;
}

.photo-feed-view__btn {
  padding: 0.75rem 1.25rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.photo-feed-view__btn--identify {
  background: linear-gradient(135deg, #d4a574 0%, #c49a6c 100%);
  color: white;
}

.photo-feed-view__btn--identify:hover:not(:disabled) {
  opacity: 0.9;
}

.photo-feed-view__btn--identify:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.photo-feed-view__error {
  margin-top: 0.75rem;
  font-size: 0.875rem;
  color: #dc2626;
}

.photo-feed-view__user {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.photo-feed-view__welcome {
  font-size: 1rem;
  color: #374151;
}

.photo-feed-view__user-actions {
  display: flex;
  gap: 0.75rem;
}

.photo-feed-view__btn--upload {
  background: linear-gradient(135deg, #d4a574 0%, #c49a6c 100%);
  color: white;
}

.photo-feed-view__btn--upload:hover {
  opacity: 0.9;
}

.photo-feed-view__btn--logout {
  background: #f3f4f6;
  color: #4b5563;
}

.photo-feed-view__btn--logout:hover {
  background: #e5e7eb;
}

.photo-feed-view__main {
  margin-top: 2rem;
}

@media (max-width: 640px) {
  .photo-feed-view__title {
    font-size: 1.75rem;
  }

  .photo-feed-view__identify-form {
    flex-direction: column;
  }

  .photo-feed-view__user-actions {
    flex-direction: column;
    width: 100%;
  }

  .photo-feed-view__btn {
    width: 100%;
  }
}
</style>
