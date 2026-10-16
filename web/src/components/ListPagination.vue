<script setup lang="ts">
defineProps<{ page: number; lastPage: number }>()
defineEmits<{ change: [page: number] }>()
</script>

<template>
  <nav
    v-if="lastPage > 1"
    class="flex items-center justify-between gap-4 text-sm"
    aria-label="Paginazione"
  >
    <button
      type="button"
      class="btn-secondary"
      :disabled="page <= 1"
      @click="$emit('change', page - 1)"
    >
      ← Precedente
    </button>
    <span class="text-slate-500">Pagina {{ page }} di {{ lastPage }}</span>
    <button
      type="button"
      class="btn-secondary"
      :disabled="page >= lastPage"
      @click="$emit('change', page + 1)"
    >
      Successiva →
    </button>
  </nav>
</template>
