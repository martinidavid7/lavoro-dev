/** Valores espelham os enums App\Enums\Modalidade e App\Enums\TipoContratacao da API. */
export type Modalidade = 1 | 2
export type TipoContratacao = 1 | 2

export const MODALIDADES: { valor: Modalidade; label: string }[] = [
  { valor: 1, label: 'Home Office' },
  { valor: 2, label: 'Presencial' },
]

export const TIPOS_CONTRATACAO: { valor: TipoContratacao; label: string }[] = [
  { valor: 1, label: 'CLT' },
  { valor: 2, label: 'PJ' },
]

export interface Vaga {
  id: number
  titulo: string
  descricao: string
  salario: string
  modalidade: Modalidade
  modalidade_label: string
  tipo: TipoContratacao
  tipo_label: string
  publicacao: string
  created_at: string
  updated_at: string
}

export interface VagaPayload {
  titulo: string
  descricao: string
  salario: number
  modalidade: Modalidade
  tipo: TipoContratacao
}

export interface FiltrosVaga {
  titulo?: string
  modalidade?: Modalidade
  tipo?: TipoContratacao
  page?: number
}
