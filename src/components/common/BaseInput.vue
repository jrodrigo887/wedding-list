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

<script setup lang="ts">
import { ref } from 'vue'
import { generateId } from '@/utils/helpers'

interface Props {
  modelValue?: string | number
  type?: string
  label?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  error?: string
  hint?: string
}

withDefaults(defineProps<Props>(), {
  modelValue: '',
  type: 'text',
  label: '',
  placeholder: '',
  disabled: false,
  required: false,
  error: '',
  hint: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: [event: FocusEvent]
}>()

const inputId = ref(generateId())

const handleInput = (event: Event): void => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

const handleBlur = (event: FocusEvent): void => {
  emit('blur', event)
}
</script>
