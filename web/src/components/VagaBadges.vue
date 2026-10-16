<script setup lang="ts">
import type { Vaga } from '@/types/vaga'

defineProps<{ vaga: Pick<Vaga, 'modalidade_label' | 'tipo_label'> }>()
</script>

<template>
  <div class="flex flex-wrap gap-2 text-xs font-medium">
    <span class="rounded-full bg-indigo-50 px-2.5 py-1 text-indigo-700">
      {{ vaga.modalidade_label }}
    </span>
    <span class="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">
      {{ vaga.tipo_label }}
    </span>
  </div>
</template>
