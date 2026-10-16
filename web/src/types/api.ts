/** Shape of a paginated Laravel API Resource collection. */
export interface Paginated<T> {
  data: T[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
    from: number | null
    to: number | null
  }
}

/** Shape of a single Laravel API Resource. */
export interface Resource<T> {
  data: T
}

export type ValidationErrors = Record<string, string[]>
