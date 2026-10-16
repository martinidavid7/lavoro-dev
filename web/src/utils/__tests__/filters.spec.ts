import { describe, expect, it } from 'vitest'
import { filtersFromQuery, filtersToQuery } from '../filters'

describe('filtersFromQuery', () => {
  it('converts the Italian query string into typed filters', () => {
    expect(
      filtersFromQuery({
        cerca: 'vue',
        modalita: '1',
        contratto: '2',
        azienda: '5',
        competenze: '3,7',
        pagina: '3',
      }),
    ).toEqual({
      title: 'vue',
      work_mode: 1,
      contract_type: 2,
      company: 5,
      skills: [3, 7],
      page: 3,
    })
  })

  it('ignores empty or invalid values', () => {
    expect(
      filtersFromQuery({
        cerca: '',
        modalita: 'abc',
        azienda: '0',
        competenze: 'x,',
        pagina: '-1',
      }),
    ).toEqual({
      title: undefined,
      work_mode: undefined,
      contract_type: undefined,
      company: undefined,
      skills: undefined,
      page: undefined,
    })
  })

  it('keeps the valid skill ids, without duplicates', () => {
    expect(filtersFromQuery({ competenze: '3, 7,3,abc,-2' }).skills).toEqual([3, 7])
  })
})

describe('filtersToQuery', () => {
  it('omits empty filters and the first page', () => {
    expect(filtersToQuery({ title: 'php', skills: [], page: 1 })).toEqual({ cerca: 'php' })
  })

  it('is the inverse of filtersFromQuery', () => {
    const filters = {
      title: 'php',
      work_mode: 2,
      contract_type: 1,
      company: 7,
      skills: [3, 7],
      page: 4,
    } as const

    expect(
      filtersFromQuery(filtersToQuery({ ...filters, skills: [3, 7] }) as Record<string, string>),
    ).toEqual(filters)
  })
})
