import type { ValidationErrors } from '@/types/api'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'

/** Sanctum's endpoint that sets the XSRF-TOKEN cookie, at the API's origin. */
const CSRF_COOKIE_URL = new URL('/sanctum/csrf-cookie', BASE_URL).href

const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS']

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

  get isUnauthenticated() {
    return this.status === 401
  }

  get isForbidden() {
    return this.status === 403
  }

  /** CSRF token missing or expired (Laravel answers 419). */
  get isCsrfMismatch() {
    return this.status === 419
  }
}

function readCookie(name: string) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))

  return match?.[1] ? decodeURIComponent(match[1]) : null
}

async function fetchCsrfCookie() {
  await fetch(CSRF_COOKIE_URL, { credentials: 'include' })
}

/** One request; resolves to the successful response or throws ApiError. */
async function send(path: string, init: RequestInit): Promise<Response> {
  const method = (init.method ?? 'GET').toUpperCase()
  const xsrfToken = SAFE_METHODS.includes(method) ? null : readCookie('XSRF-TOKEN')
  let response: Response

  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...init,
      // Sends the session cookie: authentication is Sanctum's SPA mode, not tokens.
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        // FormData (file uploads) needs the multipart boundary the browser generates.
        ...(init.body && !(init.body instanceof FormData)
          ? { 'Content-Type': 'application/json' }
          : {}),
        ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : {}),
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

  return response
}

/**
 * Requests that change data first make sure the CSRF cookie exists; if the token
 * has expired (419), it is renewed and the request is retried once.
 */
async function sendWithCsrf(path: string, init: RequestInit): Promise<Response> {
  const method = (init.method ?? 'GET').toUpperCase()

  if (SAFE_METHODS.includes(method)) return send(path, init)

  if (!readCookie('XSRF-TOKEN')) await fetchCsrfCookie()

  try {
    return await send(path, init)
  } catch (e) {
    if (!(e instanceof ApiError && e.isCsrfMismatch)) throw e

    await fetchCsrfCookie()

    return send(path, init)
  }
}

/**
 * fetch wrapper for the API: sets the JSON headers, sends the session cookie and the
 * CSRF token, turns error responses into ApiError and handles 204 (No Content).
 */
export async function http<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await sendWithCsrf(path, init)

  return response.status === 204 ? (undefined as T) : response.json()
}

/**
 * Downloads a protected file (e.g. a CV): the session cookie is needed, so a plain
 * link would not work. The file name comes from the Content-Disposition header.
 */
export async function download(path: string): Promise<{ blob: Blob; filename: string | null }> {
  const response = await sendWithCsrf(path, {})
  const disposition = response.headers.get('Content-Disposition') ?? ''
  // filename* (RFC 5987) carries non-ASCII names like "Nicolò"; filename is the ASCII fallback.
  const encoded = disposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1]
  const plain = disposition.match(/filename="?([^";]+)"?/i)?.[1]
  const filename = encoded ? decodeURIComponent(encoded) : plain

  return { blob: await response.blob(), filename: filename || null }
}
