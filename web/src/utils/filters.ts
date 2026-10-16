import type { LocationQuery, LocationQueryRaw } from 'vue-router'
import type { ContractType, JobPostingFilters, WorkMode } from '@/types/jobPosting'

/**
 * The URL is user-facing, so its query keys are in Italian
 * (?cerca=vue&modalita=1&contratto=2&azienda=5&competenze=3,7&pagina=3) and are mapped to the API filters here.
 */
const QUERY_KEYS = {
  title: 'cerca',
  work_mode: 'modalita',
  contract_type: 'contratto',
  company: 'azienda',
  skills: 'competenze',
  page: 'pagina',
} as const

function positiveInteger(value: unknown) {
  if (typeof value !== 'string' || value === '') return undefined

  const number = Number(value)

  return Number.isInteger(number) && number > 0 ? number : undefined
}

/** "3,7,3,x" → [3, 7]: positive integers, without duplicates; undefined if none. */
function idList(value: unknown) {
  if (typeof value !== 'string') return undefined

  const ids = [...new Set(value.split(',').map((part) => positiveInteger(part.trim())))].filter(
    (id): id is number => id !== undefined,
  )

  return ids.length ? ids : undefined
}

/** Reads the filters from the route query string. */
export function filtersFromQuery(query: LocationQuery): JobPostingFilters {
  const title = query[QUERY_KEYS.title]

  return {
    title: typeof title === 'string' && title !== '' ? title : undefined,
    work_mode: positiveInteger(query[QUERY_KEYS.work_mode]) as WorkMode | undefined,
    contract_type: positiveInteger(query[QUERY_KEYS.contract_type]) as ContractType | undefined,
    company: positiveInteger(query[QUERY_KEYS.company]),
    skills: idList(query[QUERY_KEYS.skills]),
    page: positiveInteger(query[QUERY_KEYS.page]),
  }
}

/** Converts the filters into a query string, omitting empty values and page 1. */
export function filtersToQuery(filters: JobPostingFilters): LocationQueryRaw {
  const query: LocationQueryRaw = {}

  if (filters.title) query[QUERY_KEYS.title] = filters.title
  if (filters.work_mode) query[QUERY_KEYS.work_mode] = String(filters.work_mode)
  if (filters.contract_type) query[QUERY_KEYS.contract_type] = String(filters.contract_type)
  if (filters.company) query[QUERY_KEYS.company] = String(filters.company)
  if (filters.skills?.length) query[QUERY_KEYS.skills] = filters.skills.join(',')
  if (filters.page && filters.page > 1) query[QUERY_KEYS.page] = String(filters.page)

  return query
}
