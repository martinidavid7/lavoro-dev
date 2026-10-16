import { ref } from 'vue'
import { defineStore } from 'pinia'

export type TipoNotificacao = 'sucesso' | 'erro'

export interface Notificacao {
  id: number
  tipo: TipoNotificacao
  titulo: string
  descricao?: string
}

const DURACAO_MS = 4000

let proximoId = 0

/** Fila de notificações (toasts) exibidas pelo ToastContainer. */
export const useNotificacoesStore = defineStore('notificacoes', () => {
  const itens = ref<Notificacao[]>([])

  function remover(id: number) {
    itens.value = itens.value.filter((item) => item.id !== id)
  }

  function notificar(tipo: TipoNotificacao, titulo: string, descricao?: string) {
    const id = ++proximoId

    itens.value.push({ id, tipo, titulo, descricao })
    setTimeout(() => remover(id), DURACAO_MS)
  }

  return {
    itens,
    remover,
    sucesso: (titulo: string, descricao?: string) => notificar('sucesso', titulo, descricao),
    erro: (titulo: string, descricao?: string) => notificar('erro', titulo, descricao),
  }
})
