<script setup lang="ts">
import { onMounted } from 'vue';
import { usePhotosStore } from '../../infrastructure/stores';
import { usePhotoRealtime } from '../../infrastructure/composables';
import PhotoCard from './PhotoCard.vue';

/**
 * Component: PhotoFeed
 * Grid de fotos com realtime
 */

const store = usePhotosStore();
const { isConnected } = usePhotoRealtime();

const emit = defineEmits<{
  (e: 'view', photo: (typeof store.photos)[0]): void;
}>();

onMounted(async () => {
  await store.fetchApprovedPhotos();
});

const handleLike = (photoId: number) => {
  store.toggleLike(photoId);
};

const handleView = (photo: (typeof store.photos)[0]) => {
  emit('view', photo);
};
</script>

<template>
  <div class="photo-feed">
    <!-- Status de conexão -->
    <div class="photo-feed__status">
      <span
        class="photo-feed__indicator"
        :class="{ 'photo-feed__indicator--connected': isConnected }"
      ></span>
      <span class="photo-feed__status-text">
        {{ isConnected ? 'Ao vivo' : 'Reconectando...' }}
      </span>
    </div>

    <!-- Loading -->
    <div v-if="store.loading" class="photo-feed__loading">
      <div class="photo-feed__spinner"></div>
      <p>Carregando fotos...</p>
    </div>

    <!-- Empty -->
    <div v-else-if="!store.hasPhotos" class="photo-feed__empty">
      <span class="photo-feed__empty-icon">📷</span>
      <p class="photo-feed__empty-text">Nenhuma foto ainda</p>
      <p class="photo-feed__empty-hint">Seja o primeiro a compartilhar!</p>
    </div>

    <!-- Grid -->
    <div v-else class="photo-feed__grid">
      <PhotoCard
        v-for="photo in store.photos"
        :key="photo.id"
        :photo="photo"
        :current-user-code="store.currentGuestCode"
        @like="handleLike"
        @view="handleView"
      />
    </div>
  </div>
</template>

<style scoped>
.photo-feed {
  width: 100%;
}

.photo-feed__status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.75rem;
  color: #6b7280;
}

.photo-feed__indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ef4444;
}

.photo-feed__indicator--connected {
  background: #10b981;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.photo-feed__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #6b7280;
}

.photo-feed__spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top-color: #d4a574;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.photo-feed__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.photo-feed__empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.photo-feed__empty-text {
  font-size: 1.25rem;
  color: #374151;
  margin: 0 0 0.5rem 0;
}

.photo-feed__empty-hint {
  font-size: 0.875rem;
  color: #9ca3af;
  margin: 0;
}

.photo-feed__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

@media (max-width: 640px) {
  .photo-feed__grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>
