import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import type { Vaga } from '@/types/vaga'

export type VagaFavorita = Pick<Vaga, 'id' | 'titulo'>

const CHAVE_STORAGE = 'vagas:favoritas'

function carregar(): VagaFavorita[] {
  try {
    const salvas = JSON.parse(localStorage.getItem(CHAVE_STORAGE) ?? '[]')

    return Array.isArray(salvas) ? salvas : []
  } catch {
    return []
  }
}

/** Vagas favoritadas pelo usuário, persistidas no localStorage. */
export const useFavoritasStore = defineStore('favoritas', () => {
  const vagas = ref<VagaFavorita[]>(carregar())

  watch(
    vagas,
    (valor) => {
      try {
        localStorage.setItem(CHAVE_STORAGE, JSON.stringify(valor))
      } catch {
        // storage indisponível (modo privado, cota cheia): mantém só em memória
      }
    },
    { deep: true },
  )

  const total = computed(() => vagas.value.length)

  function ehFavorita(id: number) {
    return vagas.value.some((vaga) => vaga.id === id)
  }

  function remover(id: number) {
    vagas.value = vagas.value.filter((vaga) => vaga.id !== id)
  }

  function alternar({ id, titulo }: VagaFavorita) {
    if (ehFavorita(id)) remover(id)
    else vagas.value.push({ id, titulo })
  }

  return { vagas, total, ehFavorita, alternar, remover }
})
