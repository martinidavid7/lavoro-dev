import type { LocationQuery, LocationQueryRaw } from 'vue-router'
import type { FiltrosVaga, Modalidade, TipoContratacao } from '@/types/vaga'

function inteiro(valor: unknown) {
  if (typeof valor !== 'string' || valor === '') return undefined

  const numero = Number(valor)

  return Number.isInteger(numero) && numero > 0 ? numero : undefined
}

/** Lê os filtros da query string da rota (?titulo=vue&modalidade=1&page=2). */
export function filtrosDaQuery(query: LocationQuery): FiltrosVaga {
  return {
    titulo: typeof query.titulo === 'string' && query.titulo !== '' ? query.titulo : undefined,
    modalidade: inteiro(query.modalidade) as Modalidade | undefined,
    tipo: inteiro(query.tipo) as TipoContratacao | undefined,
    page: inteiro(query.page),
  }
}

/** Converte os filtros em query string, omitindo os vazios e a página 1. */
export function filtrosParaQuery(filtros: FiltrosVaga): LocationQueryRaw {
  const query: LocationQueryRaw = {}

  if (filtros.titulo) query.titulo = filtros.titulo
  if (filtros.modalidade) query.modalidade = String(filtros.modalidade)
  if (filtros.tipo) query.tipo = String(filtros.tipo)
  if (filtros.page && filtros.page > 1) query.page = String(filtros.page)

  return query
}
