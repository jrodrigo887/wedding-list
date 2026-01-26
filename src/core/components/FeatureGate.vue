<template>
  <slot v-if="isEnabled" />
  <slot v-else name="fallback">
    <span v-if="fallback">{{ fallback }}</span>
  </slot>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { hasFeature } from '@/config/tenant'
import type { TenantConfig } from '@/config/tenant'

const props = defineProps<{
  feature: keyof TenantConfig['features']
  fallback?: string
}>()

const isEnabled = computed(() => hasFeature(props.feature))
</script>
