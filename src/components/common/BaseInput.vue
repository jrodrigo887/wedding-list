<template>
  <div class="base-input">
    <label v-if="label" :for="inputId" class="base-input__label">
      {{ label }}
      <span v-if="required" class="base-input__required">*</span>
    </label>

    <div class="base-input__wrapper">
      <input
        :id="inputId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :class="inputClasses"
        @input="handleInput"
        @blur="handleBlur"
      />
    </div>

    <p v-if="error" class="base-input__error">{{ error }}</p>
    <p v-else-if="hint" class="base-input__hint">{{ hint }}</p>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { generateId } from '@/utils/helpers'

// ========================================
// Props
// ========================================
const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
  type: {
    type: String,
    default: 'text',
  },
  label: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  required: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: '',
  },
  hint: {
    type: String,
    default: '',
  },
})

// ========================================
// Emits
// ========================================
const emit = defineEmits(['update:modelValue', 'blur'])

// ========================================
// Data
// ========================================
const inputId = ref(generateId())

// ========================================
// Computed
// ========================================
const inputClasses = computed(() => {
  return [
    'base-input__field',
    {
      'base-input__field--error': props.error,
      'base-input__field--disabled': props.disabled,
    },
  ]
})

// ========================================
// Methods
// ========================================
const handleInput = (event) => {
  emit('update:modelValue', event.target.value)
}

const handleBlur = (event) => {
  emit('blur', event)
}
</script>

<style scoped>
.base-input {
  width: 100%;
}

.base-input__label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #3d2b1f;
  font-size: 0.875rem;
}

.base-input__required {
  color: #dc3545;
  margin-left: 0.25rem;
}

.base-input__wrapper {
  position: relative;
}

.base-input__field {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  font-family: inherit;
  color: #3d2b1f;
  background-color: #fff;
  border: 2px solid #E8DCC8;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
}

.base-input__field:focus {
  outline: none;
  border-color: #8B3A3A;
  box-shadow: 0 0 0 3px rgba(139, 58, 58, 0.1);
}

.base-input__field:hover:not(:disabled):not(:focus) {
  border-color: #D4A574;
}

.base-input__field::placeholder {
  color: #B4A089;
}

.base-input__field--error {
  border-color: #dc3545;
}

.base-input__field--error:focus {
  border-color: #dc3545;
  box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
}

.base-input__field--disabled {
  background-color: #F5E6D3;
  cursor: not-allowed;
  opacity: 0.6;
}

.base-input__error {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #dc3545;
}

.base-input__hint {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #8B7355;
}
</style>
