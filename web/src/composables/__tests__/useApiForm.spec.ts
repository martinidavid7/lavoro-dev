import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { ApiError } from '@/services/http'
import { useNotificationsStore } from '@/stores/notifications'
import { useApiForm } from '../useApiForm'

describe('useApiForm', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('resolves to the result and tracks the submitting flag', async () => {
    const { submit, submitting } = useApiForm('Errore')
    let resolve!: (value: string) => void

    const result = submit(() => new Promise<string>((r) => (resolve = r)))
    expect(submitting.value).toBe(true)

    resolve('fatto')

    await expect(result).resolves.toBe('fatto')
    expect(submitting.value).toBe(false)
  })

  it('exposes the per-field errors of a validation error', async () => {
    const { submit, errors } = useApiForm('Errore')

    const result = await submit(() =>
      Promise.reject(new ApiError(422, 'Dati non validi', { email: ['Obbligatorio'] })),
    )

    expect(result).toBeUndefined()
    expect(errors.value).toEqual({ email: ['Obbligatorio'] })
    expect(useNotificationsStore().items[0]?.title).toBe('Controlla i campi evidenziati')
  })

  it('notifies other errors with the given title and clears old field errors', async () => {
    const { submit, errors } = useApiForm('Accesso non riuscito')
    errors.value = { email: ['Vecchio errore'] }

    await submit(() => Promise.reject(new ApiError(500, 'Errore del server')))

    expect(errors.value).toEqual({})
    expect(useNotificationsStore().items[0]).toMatchObject({
      title: 'Accesso non riuscito',
      description: 'Errore del server',
    })
  })
})
