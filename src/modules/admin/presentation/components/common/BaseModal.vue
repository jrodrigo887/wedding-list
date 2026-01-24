<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="modal-overlay" @click.self="handleClose">
        <div class="modal" :class="sizeClass">
          <div v-if="title" class="modal__header">
            <h2 class="modal__title">{{ title }}</h2>
            <button class="modal__close" @click="handleClose">✕</button>
          </div>
          <div class="modal__body">
            <slot></slot>
          </div>
          <div v-if="$slots.footer" class="modal__footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  show: boolean;
  title?: string;
  size?: 'sm' | 'md' | 'lg';
  closable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  closable: true,
});

const emit = defineEmits<{
  close: [];
}>();

const sizeClass = computed(() => `modal--${props.size}`);

const handleClose = () => {
  if (props.closable) {
    emit('close');
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal {
  background: #1a1a2e;
  border-radius: 1rem;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal--sm {
  max-width: 400px;
}

.modal--md {
  max-width: 500px;
}

.modal--lg {
  max-width: 700px;
}

.modal__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #2d2d44;
}

.modal__title {
  color: #fff;
  font-size: 1.125rem;
  margin: 0;
}

.modal__close {
  background: none;
  border: none;
  color: #64748b;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.25rem;
  line-height: 1;
  transition: color 0.2s;
}

.modal__close:hover {
  color: #fff;
}

.modal__body {
  padding: 1.5rem;
}

.modal__footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #2d2d44;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal,
.modal-leave-active .modal {
  transition: transform 0.2s ease;
}

.modal-enter-from .modal,
.modal-leave-to .modal {
  transform: scale(0.95);
}
</style>
