<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-overlay" @click="$emit('close')">
        <div class="modal" @click.stop>
          <button class="modal__close" @click="$emit('close')">&times;</button>

          <div class="modal__content">
            <iframe
              :src="url"
              class="modal__iframe"
              allow="payment"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation"
            />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  url: {
    type: String,
    required: true,
  },
})

defineEmits(['close'])
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  backdrop-filter: blur(4px);
}

.modal {
  position: relative;
  width: 100%;
  max-width: 450px;
  height: 90vh;
  max-height: 700px;
  background: white;
  border-radius: 1.5rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal__close {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  font-size: 1.5rem;
  color: #666;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 10;
}

.modal__close:hover {
  background: white;
  color: #333;
  transform: scale(1.1);
}

.modal__content {
  flex: 1;
  overflow: hidden;
}

.modal__iframe {
  width: 100%;
  height: 100%;
  border: none;
}

/* Animations */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .modal,
.modal-leave-active .modal {
  transition: transform 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal,
.modal-leave-to .modal {
  transform: scale(0.9);
}

/* Mobile */
@media (max-width: 640px) {
  .modal {
    max-width: 100%;
    height: 95vh;
    max-height: none;
    border-radius: 1rem 1rem 0 0;
    margin-top: auto;
  }

  .modal-overlay {
    align-items: flex-end;
    padding: 0;
  }
}
</style>
