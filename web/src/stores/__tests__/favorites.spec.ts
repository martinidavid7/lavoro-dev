import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import * as favoritesApi from '@/services/favorites'
import type { JobPosting } from '@/types/jobPosting'
import type { User } from '@/types/user'
import { useAuthStore } from '../auth'
import { useFavoritesStore } from '../favorites'
import { useNotificationsStore } from '../notifications'

vi.mock('@/services/favorites')

const candidate: User = {
  id: 3,
  name: 'Giulia Rossi',
  email: 'giulia@example.com',
  role: 'candidate',
  role_label: 'Candidato',
}

const job = { id: 1, title: 'Dev Vue', company: { name: 'Acme' } }

describe('useFavoritesStore', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    localStorage.clear()
    setActivePinia(createPinia())
    vi.mocked(favoritesApi.listFavorites).mockResolvedValue([])
  })

  it('loads the favorites of the logged in candidate', async () => {
    vi.mocked(favoritesApi.listFavorites).mockResolvedValue([
      { id: 7, title: 'Dev PHP', company: { id: 2, name: 'Beta', logo_url: null } } as JobPosting,
    ])
    const favorites = useFavoritesStore()

    useAuthStore().user = candidate
    await flushPromises()

    expect(favorites.items).toEqual([
      { id: 7, title: 'Dev PHP', company: { id: 2, name: 'Beta', logo_url: null } },
    ])
    expect(favorites.isFavorite(7)).toBe(true)
  })

  it('has no favorites for guests and companies', async () => {
    const favorites = useFavoritesStore()
    expect(favorites.enabled).toBe(false)

    useAuthStore().user = { ...candidate, role: 'company', role_label: 'Azienda' }
    await flushPromises()

    expect(favorites.enabled).toBe(false)
    expect(favoritesApi.listFavorites).not.toHaveBeenCalled()
  })

  it('saves and removes a favorite through the API', async () => {
    useAuthStore().user = candidate
    const favorites = useFavoritesStore()
    await flushPromises()

    await favorites.toggle(job)
    expect(favoritesApi.addFavorite).toHaveBeenCalledWith(1)
    expect(favorites.count).toBe(1)

    await favorites.toggle(job)
    expect(favoritesApi.removeFavorite).toHaveBeenCalledWith(1)
    expect(favorites.count).toBe(0)
  })

  it('undoes the change when the API fails', async () => {
    useAuthStore().user = candidate
    vi.mocked(favoritesApi.addFavorite).mockRejectedValue(new Error('offline'))
    const favorites = useFavoritesStore()
    await flushPromises()

    await favorites.toggle(job)

    expect(favorites.isFavorite(1)).toBe(false)
    expect(useNotificationsStore().items[0]?.title).toBe('Impossibile salvare nei preferiti')
  })

  it("forgets the favorites on logout and loads the next account's ones", async () => {
    const auth = useAuthStore()
    auth.user = candidate
    vi.mocked(favoritesApi.listFavorites).mockResolvedValueOnce([
      { id: 7, title: 'Dev PHP', company: { id: 2, name: 'Beta', logo_url: null } } as JobPosting,
    ])
    const favorites = useFavoritesStore()
    await flushPromises()
    expect(favorites.count).toBe(1)

    auth.user = null
    await flushPromises()

    expect(favorites.count).toBe(0)
  })

  it('removes the favorites that older versions kept in the browser', () => {
    localStorage.setItem('jobs:favorites', '[{"id":1,"title":"QA Engineer Mid"}]')

    useFavoritesStore()

    expect(localStorage.getItem('jobs:favorites')).toBeNull()
  })
})
