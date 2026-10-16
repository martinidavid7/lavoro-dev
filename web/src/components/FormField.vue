<script setup lang="ts">
defineProps<{
  id: string
  label: string
  hint?: string
  errors?: string[]
}>()
</script>

<template>
  <div class="space-y-1.5">
    <label :for="id" class="block text-sm font-medium text-slate-700">{{ label }}</label>
    <slot :invalid="!!errors?.length" />
    <p v-if="errors?.length" :id="`${id}-error`" class="text-xs text-red-600">{{ errors[0] }}</p>
    <p v-else-if="hint" class="text-xs text-slate-500">{{ hint }}</p>
  </div>
</template>
