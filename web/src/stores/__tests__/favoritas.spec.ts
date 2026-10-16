import { beforeEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { useFavoritasStore } from '../favoritas'

describe('useFavoritasStore', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('alterna uma vaga entre favoritada e não favoritada', () => {
    const store = useFavoritasStore()

    store.alternar({ id: 1, titulo: 'Dev Vue' })
    expect(store.ehFavorita(1)).toBe(true)
    expect(store.total).toBe(1)

    store.alternar({ id: 1, titulo: 'Dev Vue' })
    expect(store.ehFavorita(1)).toBe(false)
    expect(store.total).toBe(0)
  })

  it('persiste as favoritas no localStorage', async () => {
    useFavoritasStore().alternar({ id: 7, titulo: 'Dev PHP' })
    await nextTick()

    setActivePinia(createPinia())

    expect(useFavoritasStore().vagas).toEqual([{ id: 7, titulo: 'Dev PHP' }])
  })

  it('ignora dados corrompidos no localStorage', () => {
    localStorage.setItem('vagas:favoritas', '{invalido')

    expect(useFavoritasStore().vagas).toEqual([])
  })
})
