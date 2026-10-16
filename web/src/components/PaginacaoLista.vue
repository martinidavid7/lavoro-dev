<script setup lang="ts">
defineProps<{ pagina: number; ultimaPagina: number }>()
defineEmits<{ mudar: [pagina: number] }>()
</script>

<template>
  <nav
    v-if="ultimaPagina > 1"
    class="flex items-center justify-between gap-4 text-sm"
    aria-label="Paginação"
  >
    <button
      type="button"
      class="btn-secundario"
      :disabled="pagina <= 1"
      @click="$emit('mudar', pagina - 1)"
    >
      ← Anterior
    </button>
    <span class="text-slate-500">Página {{ pagina }} de {{ ultimaPagina }}</span>
    <button
      type="button"
      class="btn-secundario"
      :disabled="pagina >= ultimaPagina"
      @click="$emit('mudar', pagina + 1)"
    >
      Próxima →
    </button>
  </nav>
</template>
