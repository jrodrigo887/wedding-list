<script setup lang="ts">
import type { Photo } from '../../domain/entities';
import LikeButton from './LikeButton.vue';

/**
 * Component: PhotoCard
 * Card de foto individual para o feed
 */

interface Props {
  photo: Photo;
  currentUserCode?: string | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'like', id: number): void;
  (e: 'view', photo: Photo): void;
}>();

const formatDate = (dateStr?: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};
</script>

<template>
  <div class="photo-card" @click="emit('view', photo)">
    <div class="photo-card__image-wrapper">
      <img
        :src="photo.public_url"
        :alt="photo.caption || 'Foto do casamento'"
        class="photo-card__image"
        loading="lazy"
      />
      <div class="photo-card__overlay">
        <span class="photo-card__view-text">Ver foto</span>
      </div>
    </div>

    <div class="photo-card__content">
      <div class="photo-card__header">
        <span class="photo-card__author">{{ photo.nome_convidado }}</span>
        <span class="photo-card__date">{{ formatDate(photo.created_at) }}</span>
      </div>

      <p v-if="photo.caption" class="photo-card__caption">
        {{ photo.caption }}
      </p>

      <div class="photo-card__actions" @click.stop>
        <LikeButton
          :liked="photo.user_liked || false"
          :count="photo.likes_count || 0"
          :disabled="!currentUserCode"
          @toggle="emit('like', photo.id!)"
        />
        <button class="photo-card__comment-btn" @click="emit('view', photo)">
          <span>💬</span>
          <span>{{ photo.comments_count || 0 }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.photo-card {
  background: white;
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.photo-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.photo-card__image-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
}

.photo-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.photo-card:hover .photo-card__image {
  transform: scale(1.05);
}

.photo-card__overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.photo-card:hover .photo-card__overlay {
  opacity: 1;
}

.photo-card__view-text {
  color: white;
  font-weight: 500;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 9999px;
}

.photo-card__content {
  padding: 1rem;
}

.photo-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.photo-card__author {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.photo-card__date {
  font-size: 0.75rem;
  color: #9ca3af;
}

.photo-card__caption {
  font-size: 0.875rem;
  color: #4b5563;
  margin: 0 0 0.75rem 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.photo-card__actions {
  display: flex;
  gap: 0.5rem;
}

.photo-card__comment-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 0.75rem;
  border: none;
  background: transparent;
  border-radius: 9999px;
  cursor: pointer;
  font-size: 0.875rem;
  color: #6b7280;
  transition: background 0.2s;
}

.photo-card__comment-btn:hover {
  background: #f3f4f6;
}

.photo-card__comment-btn span:first-child {
  font-size: 1.125rem;
}
</style>
