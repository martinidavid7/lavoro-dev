import type { ValidationErrors } from '@/types/api'

const BASE_URL = import.meta.env.VITE_API_URL

export class ApiError extends Error {
  readonly status: number
  readonly errors: ValidationErrors

  constructor(status: number, message: string, errors: ValidationErrors = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }

  get isValidation() {
    return this.status === 422
  }

  get isNotFound() {
    return this.status === 404
  }
}

/**
 * fetch wrapper for the API: sets the JSON headers, turns error responses
 * into ApiError and handles 204 (No Content).
 */
export async function http<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response

  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...init.headers,
      },
    })
  } catch {
    throw new ApiError(0, 'Impossibile connettersi al server.')
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new ApiError(response.status, body.message ?? 'Errore imprevisto.', body.errors)
  }

  return response.status === 204 ? (undefined as T) : response.json()
}
