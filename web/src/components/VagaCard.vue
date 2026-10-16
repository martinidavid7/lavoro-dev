<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useFavoritasStore } from '@/stores/favoritas'
import type { Vaga } from '@/types/vaga'
import { formatarData, formatarMoeda } from '@/utils/formatters'
import IconeEstrela from './IconeEstrela.vue'
import VagaBadges from './VagaBadges.vue'

defineProps<{ vaga: Vaga }>()
defineEmits<{ excluir: [vaga: Vaga] }>()

const favoritas = useFavoritasStore()
</script>

<template>
  <article
    class="rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition hover:shadow-md"
  >
    <div class="flex items-start justify-between gap-4">
      <div class="space-y-2">
        <h3 class="text-lg font-semibold text-slate-900">
          <RouterLink
            :to="{ name: 'vagas.detalhe', params: { id: vaga.id } }"
            class="hover:text-indigo-600"
          >
            {{ vaga.titulo }}
          </RouterLink>
        </h3>
        <VagaBadges :vaga="vaga" />
      </div>

      <button
        type="button"
        class="rounded-lg p-2 transition"
        :class="
          favoritas.ehFavorita(vaga.id)
            ? 'text-amber-500 hover:bg-amber-50'
            : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
        "
        :aria-pressed="favoritas.ehFavorita(vaga.id)"
        :aria-label="favoritas.ehFavorita(vaga.id) ? 'Remover dos favoritos' : 'Favoritar vaga'"
        data-test="favoritar"
        @click="favoritas.alternar(vaga)"
      >
        <IconeEstrela class="size-5" :preenchida="favoritas.ehFavorita(vaga.id)" />
      </button>
    </div>

    <p class="mt-3 line-clamp-3 text-sm text-slate-600">{{ vaga.descricao }}</p>

    <footer
      class="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-sm"
    >
      <div class="flex flex-wrap gap-x-4 gap-y-1 text-slate-500">
        <span class="font-semibold text-slate-900" data-test="salario">
          {{ formatarMoeda(vaga.salario) }}
        </span>
        <span>Publicada em {{ formatarData(vaga.publicacao) }}</span>
      </div>

      <button type="button" class="btn-perigo px-3 py-1.5" @click="$emit('excluir', vaga)">
        Excluir
      </button>
    </footer>
  </article>
</template>
