import { describe, expect, it } from 'vitest'
import { filtrosDaQuery, filtrosParaQuery } from '../filtros'

describe('filtrosDaQuery', () => {
  it('converte a query string em filtros tipados', () => {
    expect(filtrosDaQuery({ titulo: 'vue', modalidade: '1', tipo: '2', page: '3' })).toEqual({
      titulo: 'vue',
      modalidade: 1,
      tipo: 2,
      page: 3,
    })
  })

  it('ignora valores vazios ou inválidos', () => {
    expect(filtrosDaQuery({ titulo: '', modalidade: 'abc', page: '-1' })).toEqual({
      titulo: undefined,
      modalidade: undefined,
      tipo: undefined,
      page: undefined,
    })
  })
})

describe('filtrosParaQuery', () => {
  it('omite filtros vazios e a primeira página', () => {
    expect(filtrosParaQuery({ titulo: 'php', page: 1 })).toEqual({ titulo: 'php' })
  })

  it('é o inverso de filtrosDaQuery', () => {
    const filtros = { titulo: 'php', modalidade: 2, tipo: 1, page: 4 } as const

    expect(filtrosDaQuery(filtrosParaQuery(filtros) as Record<string, string>)).toEqual(filtros)
  })
})
