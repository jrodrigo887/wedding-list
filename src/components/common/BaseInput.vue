<template>
  <div class="w-full">
    <label v-if="label" :for="inputId" class="block mb-2 font-semibold text-gray-700 text-sm">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1">*</span>
    </label>

    <div class="relative">
      <input
        :id="inputId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        class="input-elegant"
        :class="{
          'border-red-400 focus:border-red-400 focus:ring-red-200': error,
          'bg-amber-50 cursor-not-allowed opacity-60': disabled,
        }"
        @input="handleInput"
        @blur="handleBlur"
      />
    </div>

    <p v-if="error" class="mt-2 text-sm text-red-500">{{ error }}</p>
    <p v-else-if="hint" class="mt-2 text-sm text-gray-500">{{ hint }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
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
// Methods
// ========================================
const handleInput = (event) => {
  emit('update:modelValue', event.target.value)
}

const handleBlur = (event) => {
  emit('blur', event)
}
</script>
