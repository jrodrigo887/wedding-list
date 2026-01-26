<script setup lang="ts">
import { ref } from 'vue';
import { usePhotoUpload } from '../../infrastructure/composables';
import { usePhotosStore } from '../../infrastructure/stores';
import UploadProgress from './UploadProgress.vue';

/**
 * Component: PhotoUploader
 * Interface de upload de fotos mobile-first
 */

const store = usePhotosStore();
const {
  compressing,
  compressionProgress,
  previewUrl,
  originalSize,
  compressedSize,
  generatePreview,
  clearPreview,
  uploadWithCompression,
  validateFile,
} = usePhotoUpload();

const fileInput = ref<HTMLInputElement | null>(null);
const selectedFile = ref<File | null>(null);
const caption = ref('');
const error = ref('');
const success = ref(false);

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) return;

  error.value = '';
  success.value = false;

  const validation = validateFile(file);
  if (!validation.valid) {
    error.value = validation.error || 'Arquivo inválido';
    return;
  }

  // Armazena o arquivo em um ref separado antes do input ser removido do DOM
  selectedFile.value = file;
  generatePreview(file);
};

const handleUpload = async () => {
  if (!selectedFile.value) {
    error.value = 'Nenhum arquivo selecionado';
    return;
  }

  error.value = '';
  const uploaded = await uploadWithCompression(selectedFile.value, caption.value);

  if (uploaded) {
    success.value = true;
    caption.value = '';
    selectedFile.value = null;
    setTimeout(() => {
      success.value = false;
    }, 3000);
  } else {
    error.value = store.error || 'Erro ao enviar foto';
  }
};

const handleCancel = () => {
  clearPreview();
  caption.value = '';
  error.value = '';
  selectedFile.value = null;
};
</script>

<template>
  <div class="photo-uploader">
    <!-- Estado: Sem preview -->
    <div
      v-if="!previewUrl"
      class="photo-uploader__dropzone"
      @click="triggerFileInput"
    >
      <input
        ref="fileInput"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        capture="environment"
        class="photo-uploader__input"
        @change="handleFileSelect"
      />

      <div class="photo-uploader__icon">📷</div>
      <p class="photo-uploader__text">Toque para selecionar uma foto</p>
      <p class="photo-uploader__hint">
        {{ store.remainingUploads }} fotos restantes
      </p>
    </div>

    <!-- Estado: Com preview -->
    <div v-else class="photo-uploader__preview">
      <img :src="previewUrl" alt="Preview" class="photo-uploader__image" />

      <div class="photo-uploader__info">
        <p v-if="originalSize">
          Tamanho original: <strong>{{ originalSize }}</strong>
        </p>
        <p v-if="compressedSize">
          Após compressão: <strong>{{ compressedSize }}</strong>
        </p>
      </div>

      <!-- Progresso de compressão/upload -->
      <UploadProgress
        v-if="compressing || store.uploading"
        :progress="compressing ? compressionProgress : store.uploadProgress"
        :status="compressing ? 'compressing' : 'uploading'"
      />

      <!-- Formulário de legenda -->
      <div v-if="!compressing && !store.uploading" class="photo-uploader__form">
        <textarea
          v-model="caption"
          class="photo-uploader__caption"
          placeholder="Adicione uma legenda (opcional)"
          maxlength="200"
          rows="2"
        ></textarea>

        <div class="photo-uploader__actions">
          <button
            type="button"
            class="photo-uploader__btn photo-uploader__btn--cancel"
            @click="handleCancel"
          >
            Cancelar
          </button>
          <button
            type="button"
            class="photo-uploader__btn photo-uploader__btn--upload"
            :disabled="!store.canUploadMore"
            @click="handleUpload"
          >
            Enviar Foto
          </button>
        </div>
      </div>
    </div>

    <!-- Mensagens -->
    <p v-if="error" class="photo-uploader__error">{{ error }}</p>
    <p v-if="success" class="photo-uploader__success">
      Foto enviada com sucesso!
    </p>

    <!-- Status de moderação -->
    <p class="photo-uploader__moderation">
      {{ store.moderationStatus }}
    </p>
  </div>
</template>

<style scoped>
.photo-uploader {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

.photo-uploader__dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  border: 2px dashed #d4a574;
  border-radius: 1rem;
  background: #fefdfb;
  cursor: pointer;
  transition: all 0.2s;
}

.photo-uploader__dropzone:hover {
  background: #faf4e8;
  border-color: #c49a6c;
}

.photo-uploader__input {
  display: none;
}

.photo-uploader__icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.photo-uploader__text {
  font-size: 1rem;
  color: #374151;
  margin: 0 0 0.5rem 0;
}

.photo-uploader__hint {
  font-size: 0.875rem;
  color: #9ca3af;
  margin: 0;
}

.photo-uploader__preview {
  background: white;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.photo-uploader__image {
  width: 100%;
  max-height: 300px;
  object-fit: cover;
}

.photo-uploader__info {
  padding: 0.75rem 1rem;
  background: #f9fafb;
  font-size: 0.75rem;
  color: #6b7280;
}

.photo-uploader__info p {
  margin: 0.25rem 0;
}

.photo-uploader__form {
  padding: 1rem;
}

.photo-uploader__caption {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  resize: none;
  font-family: inherit;
}

.photo-uploader__caption:focus {
  outline: none;
  border-color: #d4a574;
}

.photo-uploader__actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
}

.photo-uploader__btn {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.photo-uploader__btn--cancel {
  background: #f3f4f6;
  color: #4b5563;
}

.photo-uploader__btn--cancel:hover {
  background: #e5e7eb;
}

.photo-uploader__btn--upload {
  background: linear-gradient(135deg, #d4a574 0%, #c49a6c 100%);
  color: white;
}

.photo-uploader__btn--upload:hover:not(:disabled) {
  opacity: 0.9;
}

.photo-uploader__btn--upload:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.photo-uploader__error {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #fef2f2;
  color: #dc2626;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  text-align: center;
}

.photo-uploader__success {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #f0fdf4;
  color: #16a34a;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  text-align: center;
}

.photo-uploader__moderation {
  margin-top: 1rem;
  font-size: 0.75rem;
  color: #9ca3af;
  text-align: center;
}
</style>
