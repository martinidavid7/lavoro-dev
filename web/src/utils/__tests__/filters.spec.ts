import { describe, expect, it } from 'vitest'
import { filtersFromQuery, filtersToQuery } from '../filters'

describe('filtersFromQuery', () => {
  it('converts the Italian query string into typed filters', () => {
    expect(filtersFromQuery({ cerca: 'vue', modalita: '1', contratto: '2', pagina: '3' })).toEqual({
      title: 'vue',
      work_mode: 1,
      contract_type: 2,
      page: 3,
    })
  })

  it('ignores empty or invalid values', () => {
    expect(filtersFromQuery({ cerca: '', modalita: 'abc', pagina: '-1' })).toEqual({
      title: undefined,
      work_mode: undefined,
      contract_type: undefined,
      page: undefined,
    })
  })
})

describe('filtersToQuery', () => {
  it('omits empty filters and the first page', () => {
    expect(filtersToQuery({ title: 'php', page: 1 })).toEqual({ cerca: 'php' })
  })

  it('is the inverse of filtersFromQuery', () => {
    const filters = { title: 'php', work_mode: 2, contract_type: 1, page: 4 } as const

    expect(filtersFromQuery(filtersToQuery(filters) as Record<string, string>)).toEqual(filters)
  })
})
