<script setup lang="ts">
defineProps<{
  id: string
  label: string
  ajuda?: string
  erros?: string[]
}>()
</script>

<template>
  <div class="space-y-1.5">
    <label :for="id" class="block text-sm font-medium text-slate-700">{{ label }}</label>
    <slot :invalido="!!erros?.length" />
    <p v-if="erros?.length" :id="`${id}-erro`" class="text-xs text-red-600">{{ erros[0] }}</p>
    <p v-else-if="ajuda" class="text-xs text-slate-500">{{ ajuda }}</p>
  </div>
</template>
