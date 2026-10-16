<script setup lang="ts">
import { ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import IconeEstrela from '@/components/IconeEstrela.vue'
import VagaBadges from '@/components/VagaBadges.vue'
import { ApiError } from '@/services/http'
import { buscarVaga, excluirVaga } from '@/services/vagas'
import { useFavoritasStore } from '@/stores/favoritas'
import { useNotificacoesStore } from '@/stores/notificacoes'
import type { Vaga } from '@/types/vaga'
import { formatarData, formatarMoeda } from '@/utils/formatters'

const props = defineProps<{ id: number }>()

const router = useRouter()
const favoritas = useFavoritasStore()
const notificacoes = useNotificacoesStore()

const vaga = ref<Vaga | null>(null)
const erro = ref<string | null>(null)

watch(
  () => props.id,
  async (id) => {
    vaga.value = null
    erro.value = null

    try {
      vaga.value = await buscarVaga(id)
    } catch (e) {
      erro.value =
        e instanceof ApiError && e.naoEncontrado
          ? 'Esta vaga não existe ou foi removida.'
          : 'Não foi possível carregar a vaga.'
    }
  },
  { immediate: true },
)

async function excluir() {
  if (!vaga.value || !confirm(`Excluir a vaga "${vaga.value.titulo}"?`)) return

  try {
    await excluirVaga(vaga.value.id)
    favoritas.remover(vaga.value.id)
    notificacoes.sucesso('Vaga excluída')
    router.push({ name: 'home' })
  } catch (e) {
    notificacoes.erro('Não foi possível excluir a vaga', e instanceof Error ? e.message : undefined)
  }
}
</script>

<template>
  <div class="space-y-6">
    <RouterLink to="/" class="text-sm text-slate-500 hover:text-slate-900">
      ← Voltar para as vagas
    </RouterLink>

    <div v-if="erro" class="rounded-xl border border-slate-200 bg-white p-10 text-center">
      <p class="text-slate-600">{{ erro }}</p>
    </div>

    <article
      v-else-if="vaga"
      class="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8"
    >
      <header class="flex flex-wrap items-start justify-between gap-4">
        <div class="space-y-3">
          <h1 class="text-2xl font-bold tracking-tight text-slate-900">{{ vaga.titulo }}</h1>
          <VagaBadges :vaga="vaga" />
        </div>

        <div class="flex gap-2">
          <button type="button" class="btn-secundario" @click="favoritas.alternar(vaga)">
            <IconeEstrela
              class="size-4"
              :class="{ 'text-amber-500': favoritas.ehFavorita(vaga.id) }"
              :preenchida="favoritas.ehFavorita(vaga.id)"
            />
            {{ favoritas.ehFavorita(vaga.id) ? 'Favoritada' : 'Favoritar' }}
          </button>
          <button type="button" class="btn-perigo" @click="excluir">Excluir</button>
        </div>
      </header>

      <dl class="grid gap-4 rounded-lg bg-slate-50 p-4 text-sm sm:grid-cols-3">
        <div>
          <dt class="text-slate-500">Salário</dt>
          <dd class="font-semibold text-slate-900">{{ formatarMoeda(vaga.salario) }}</dd>
        </div>
        <div>
          <dt class="text-slate-500">Contratação</dt>
          <dd class="font-semibold text-slate-900">{{ vaga.tipo_label }}</dd>
        </div>
        <div>
          <dt class="text-slate-500">Publicada em</dt>
          <dd class="font-semibold text-slate-900">{{ formatarData(vaga.publicacao) }}</dd>
        </div>
      </dl>

      <section>
        <h2 class="mb-2 font-semibold text-slate-900">Descrição</h2>
        <p class="whitespace-pre-line text-slate-700">{{ vaga.descricao }}</p>
      </section>
    </article>

    <div v-else class="h-80 animate-pulse rounded-xl bg-slate-200/70" aria-busy="true" />
  </div>
</template>
