import { beforeEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { useFavoritesStore } from '../favorites'

describe('useFavoritesStore', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('toggles a job posting between favorite and not favorite', () => {
    const store = useFavoritesStore()

    store.toggle({ id: 1, title: 'Dev Vue' })
    expect(store.isFavorite(1)).toBe(true)
    expect(store.count).toBe(1)

    store.toggle({ id: 1, title: 'Dev Vue' })
    expect(store.isFavorite(1)).toBe(false)
    expect(store.count).toBe(0)
  })

  it('persists favorites in localStorage', async () => {
    useFavoritesStore().toggle({ id: 7, title: 'Dev PHP' })
    await nextTick()

    setActivePinia(createPinia())

    expect(useFavoritesStore().items).toEqual([{ id: 7, title: 'Dev PHP' }])
  })

  it('ignores corrupted data in localStorage', () => {
    localStorage.setItem('jobs:favorites', '{invalid')

    expect(useFavoritesStore().items).toEqual([])
  })
})
