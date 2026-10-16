/** Formato de uma coleção paginada de API Resources do Laravel. */
export interface Paginado<T> {
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

/** Formato de um API Resource individual do Laravel. */
export interface Recurso<T> {
  data: T
}

export type ErrosValidacao = Record<string, string[]>
