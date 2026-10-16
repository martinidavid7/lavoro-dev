import type { ErrosValidacao } from '@/types/api'

const BASE_URL = import.meta.env.VITE_API_URL

export class ApiError extends Error {
  readonly status: number
  readonly erros: ErrosValidacao

  constructor(status: number, message: string, erros: ErrosValidacao = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.erros = erros
  }

  get ehValidacao() {
    return this.status === 422
  }

  get naoEncontrado() {
    return this.status === 404
  }
}

/**
 * Wrapper do fetch para a API: define os headers JSON, converte respostas
 * de erro em ApiError e trata o 204 (sem conteúdo).
 */
export async function http<T>(caminho: string, init: RequestInit = {}): Promise<T> {
  let resposta: Response

  try {
    resposta = await fetch(`${BASE_URL}${caminho}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...init.headers,
      },
    })
  } catch {
    throw new ApiError(0, 'Não foi possível conectar à API.')
  }

  if (!resposta.ok) {
    const corpo = await resposta.json().catch(() => ({}))
    throw new ApiError(resposta.status, corpo.message ?? 'Erro inesperado.', corpo.errors)
  }

  return resposta.status === 204 ? (undefined as T) : resposta.json()
}
