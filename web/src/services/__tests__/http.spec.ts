import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import { ApiError, download, http } from '../http'

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'
const CSRF_URL = new URL('/sanctum/csrf-cookie', API).href

type FetchMock = Mock<typeof fetch>

function json(status: number, body: unknown = {}) {
  return new Response(status === 204 ? null : JSON.stringify(body), { status })
}

function clearCookies() {
  for (const cookie of document.cookie.split('; ')) {
    const [name] = cookie.split('=')
    if (name) document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`
  }
}

/** Like the API: GET /sanctum/csrf-cookie sets a (URL encoded) XSRF-TOKEN cookie. */
function setTokenOnCsrfRequest(fetchMock: FetchMock, token: string) {
  fetchMock.mockImplementation(async (url) => {
    if (String(url) === CSRF_URL) {
      document.cookie = `XSRF-TOKEN=${encodeURIComponent(token)}`

      return json(204)
    }

    return json(200, { ok: true })
  })
}

const sentHeaders = (fetchMock: FetchMock, call: number) =>
  fetchMock.mock.calls[call]?.[1]?.headers as Record<string, string>

describe('http', () => {
  let fetchMock: FetchMock

  beforeEach(() => {
    clearCookies()
    fetchMock = vi.fn<typeof fetch>()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => vi.unstubAllGlobals())

  it('sends GET requests with the session cookie and no CSRF round trip', async () => {
    fetchMock.mockResolvedValue(json(200, { data: [] }))

    await expect(http('/job-postings')).resolves.toEqual({ data: [] })

    expect(fetchMock).toHaveBeenCalledOnce()
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({ credentials: 'include' })
  })

  it('fetches the CSRF cookie before the first request that changes data', async () => {
    setTokenOnCsrfRequest(fetchMock, 'abc=123')

    await http('/login', { method: 'POST', body: '{}' })

    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([CSRF_URL, `${API}/login`])
    expect(sentHeaders(fetchMock, 1)['X-XSRF-TOKEN']).toBe('abc=123')
  })

  it('reuses the CSRF cookie it already has', async () => {
    document.cookie = 'XSRF-TOKEN=esistente'
    fetchMock.mockResolvedValue(json(204))

    await http('/logout', { method: 'POST' })

    expect(fetchMock).toHaveBeenCalledOnce()
    expect(sentHeaders(fetchMock, 0)['X-XSRF-TOKEN']).toBe('esistente')
  })

  it('renews an expired CSRF token (419) and retries once', async () => {
    document.cookie = 'XSRF-TOKEN=scaduto'
    fetchMock
      .mockResolvedValueOnce(json(419, { message: 'CSRF token mismatch.' }))
      .mockImplementationOnce(async () => {
        document.cookie = 'XSRF-TOKEN=nuovo'

        return json(204)
      })
      .mockResolvedValueOnce(json(201, { data: { id: 1 } }))

    await expect(http('/job-postings', { method: 'POST', body: '{}' })).resolves.toEqual({
      data: { id: 1 },
    })

    expect(fetchMock.mock.calls[1]?.[0]).toBe(CSRF_URL)
    expect(sentHeaders(fetchMock, 2)['X-XSRF-TOKEN']).toBe('nuovo')
  })

  it('lets the browser set the multipart Content-Type for file uploads', async () => {
    document.cookie = 'XSRF-TOKEN=t'
    fetchMock.mockResolvedValue(json(200, { data: {} }))
    const body = new FormData()
    body.append('logo', new File(['png'], 'logo.png', { type: 'image/png' }))

    await http('/company-profile/logo', { method: 'POST', body })

    expect(sentHeaders(fetchMock, 0)).not.toHaveProperty('Content-Type')
    expect(fetchMock.mock.calls[0]?.[1]?.body).toBe(body)
  })

  it('downloads a protected file with its name from Content-Disposition', async () => {
    fetchMock.mockResolvedValue(
      new Response('%PDF', {
        status: 200,
        headers: { 'Content-Disposition': 'attachment; filename="CV Giulia Rossi.pdf"' },
      }),
    )

    const { blob, filename } = await download('/candidate-profile/cv')

    expect(filename).toBe('CV Giulia Rossi.pdf')
    expect(await blob.text()).toBe('%PDF')
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({ credentials: 'include' })
  })

  it('reads UTF-8 file names', async () => {
    fetchMock.mockResolvedValue(
      new Response('%PDF', {
        headers: {
          'Content-Disposition':
            "attachment; filename=cv.pdf; filename*=UTF-8''Curriculum%20Nicol%C3%B2.pdf",
        },
      }),
    )

    expect((await download('/candidate-profile/cv')).filename).toBe('Curriculum Nicolò.pdf')
  })

  it('turns error responses into ApiError with the validation errors', async () => {
    document.cookie = 'XSRF-TOKEN=t'
    fetchMock.mockResolvedValue(
      json(422, { message: 'Dati non validi', errors: { email: ['Obbligatorio'] } }),
    )

    const error = await http('/login', { method: 'POST', body: '{}' }).catch((e) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({
      status: 422,
      isValidation: true,
      errors: { email: ['Obbligatorio'] },
    })
  })
})
