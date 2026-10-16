<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PaginacaoLista from '@/components/PaginacaoLista.vue'
import VagaCard from '@/components/VagaCard.vue'
import VagaFiltros from '@/components/VagaFiltros.vue'
import { excluirVaga, listarVagas } from '@/services/vagas'
import { useFavoritasStore } from '@/stores/favoritas'
import { useNotificacoesStore } from '@/stores/notificacoes'
import type { Paginado } from '@/types/api'
import type { FiltrosVaga, Vaga } from '@/types/vaga'
import { filtrosDaQuery, filtrosParaQuery } from '@/utils/filtros'

const route = useRoute()
const router = useRouter()
const favoritas = useFavoritasStore()
const notificacoes = useNotificacoesStore()

const resultado = ref<Paginado<Vaga> | null>(null)
const carregando = ref(false)
const erro = ref<string | null>(null)

// Os filtros vivem na URL: dá para compartilhar uma busca e usar o voltar do navegador.
const filtros = computed(() => filtrosDaQuery(route.query))

async function carregar() {
  carregando.value = true
  erro.value = null

  try {
    resultado.value = await listarVagas(filtros.value)
  } catch (e) {
    erro.value = e instanceof Error ? e.message : 'Erro ao carregar as vagas.'
  } finally {
    carregando.value = false
  }
}

watch(filtros, carregar, { immediate: true })

function buscar(novos: FiltrosVaga) {
  router.push({ query: filtrosParaQuery({ ...novos, page: 1 }) })
}

function mudarPagina(page: number) {
  router.push({ query: filtrosParaQuery({ ...filtros.value, page }) })
}

async function excluir(vaga: Vaga) {
  if (!confirm(`Excluir a vaga "${vaga.titulo}"?`)) return

  try {
    await excluirVaga(vaga.id)
    favoritas.remover(vaga.id)
    notificacoes.sucesso('Vaga excluída', `"${vaga.titulo}" foi removida.`)
    await carregar()
  } catch (e) {
    notificacoes.erro('Não foi possível excluir a vaga', e instanceof Error ? e.message : undefined)
  }
}
</script>

<template>
  <div class="space-y-6">
    <section>
      <h1 class="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        Encontre sua próxima vaga
      </h1>
      <p class="mt-1 text-slate-600">Oportunidades em tecnologia, presenciais e remotas.</p>
    </section>

    <VagaFiltros :filtros="filtros" @buscar="buscar" />

    <div v-if="erro" class="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
      <p class="font-medium text-red-700">{{ erro }}</p>
      <button type="button" class="btn-secundario mt-4" @click="carregar">Tentar novamente</button>
    </div>

    <template v-else-if="resultado">
      <p class="text-sm text-slate-500" aria-live="polite">
        {{ resultado.meta.total }}
        {{ resultado.meta.total === 1 ? 'vaga encontrada' : 'vagas encontradas' }}
      </p>

      <div
        v-if="resultado.data.length"
        class="space-y-4 transition-opacity"
        :class="{ 'opacity-50': carregando }"
      >
        <VagaCard v-for="vaga in resultado.data" :key="vaga.id" :vaga="vaga" @excluir="excluir" />
      </div>

      <div
        v-else
        class="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500"
      >
        Nenhuma vaga encontrada com esses filtros.
      </div>

      <PaginacaoLista
        :pagina="resultado.meta.current_page"
        :ultima-pagina="resultado.meta.last_page"
        @mudar="mudarPagina"
      />
    </template>

    <div v-else class="space-y-4" aria-busy="true">
      <div v-for="n in 3" :key="n" class="h-40 animate-pulse rounded-xl bg-slate-200/70" />
    </div>
  </div>
</template>
