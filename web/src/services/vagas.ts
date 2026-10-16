import type { Paginado, Recurso } from '@/types/api'
import type { FiltrosVaga, Vaga, VagaPayload } from '@/types/vaga'
import { http } from './http'

export function listarVagas(filtros: FiltrosVaga = {}) {
  const params = new URLSearchParams()

  for (const [chave, valor] of Object.entries(filtros)) {
    if (valor !== undefined && valor !== '') params.set(chave, String(valor))
  }

  const query = params.toString()

  return http<Paginado<Vaga>>(`/vagas${query ? `?${query}` : ''}`)
}

export async function buscarVaga(id: number) {
  const { data } = await http<Recurso<Vaga>>(`/vagas/${id}`)

  return data
}

export async function criarVaga(payload: VagaPayload) {
  const { data } = await http<Recurso<Vaga>>('/vagas', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  return data
}

export function excluirVaga(id: number) {
  return http<void>(`/vagas/${id}`, { method: 'DELETE' })
}
