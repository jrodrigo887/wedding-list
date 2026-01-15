<template>
  <header class="app-header">
    <div class="app-header__bg">
      <img :src="bgImage" alt="" class="app-header__bg-img" />
    </div>
    <div class="app-header__overlay"></div>
    <div class="app-header__container">
      <div class="app-header__content">
        <div class="app-header__text">
          <h1 class="app-header__title">{{ title }}</h1>
          <p class="app-header__subtitle">{{ subtitle }}</p>
        </div>
      </div>

      <div v-if="showDate" class="app-header__date">
        <div class="app-header__date-icon">📅</div>
        <span>{{ formattedDate }}</span>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { APP_CONFIG } from '@/utils/constants'
import { formatDate } from '@/utils/helpers'
import bgImage from '@/assets/IMG_8009.JPEG'

// ========================================
// Props
// ========================================
const props = defineProps({
  showDate: {
    type: Boolean,
    default: true,
  },
})

// ========================================
// Computed
// ========================================
const title = computed(() => `${APP_CONFIG.BRIDE_NAME} & ${APP_CONFIG.GROOM_NAME}`)
const subtitle = computed(() => APP_CONFIG.APP_NAME)
const formattedDate = computed(() => formatDate(APP_CONFIG.WEDDING_DATE))
</script>

<style scoped>
.app-header {
  width: 100%;
  background: #8B3A3A;
  color: #FFF9F0;
  box-shadow: 0 2px 8px rgba(61, 43, 31, 0.15);
  position: relative;
  overflow: hidden;
  min-height: 180px;
}

.app-header__bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}

.app-header__bg-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 30%;
  filter: blur(2px);
  opacity: 0.7;
}

.app-header__overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    rgba(139, 58, 58, 0.7) 0%,
    rgba(139, 58, 58, 0.85) 100%
  );
  pointer-events: none;
}

.app-header__container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  position: relative;
  z-index: 1;
}

.app-header__content {
  display: flex;
  align-items: center;
  gap: 1rem;
  text-align: center;
}

.app-header__text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.app-header__title {
  margin: 0;
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.5px;
}

.app-header__subtitle {
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
  opacity: 0.95;
  letter-spacing: 0.5px;
}

.app-header__date {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 9999px;
  font-size: 1rem;
  font-weight: 600;
  backdrop-filter: blur(10px);
}

.app-header__date-icon {
  font-size: 1.25rem;
}

/* Responsive */
@media (max-width: 768px) {
  .app-header__container {
    padding: 1.5rem 1rem;
    gap: 1rem;
  }

  .app-header__title {
    font-size: 2rem;
  }

  .app-header__subtitle {
    font-size: 0.875rem;
  }

}

@media (max-width: 640px) {
  .app-header__content {
    flex-direction: column;
    gap: 0.5rem;
  }

  .app-header__title {
    font-size: 1.75rem;
  }

  .app-header__date {
    font-size: 0.875rem;
    padding: 0.625rem 1.25rem;
  }
}
</style>
