import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import * as favoritesApi from '@/services/favorites'
import type { JobPosting } from '@/types/jobPosting'
import { useAuthStore } from './auth'
import { useNotificationsStore } from './notifications'

export type FavoriteJob = Pick<JobPosting, 'id' | 'title'> & {
  company: Pick<JobPosting['company'], 'name'>
}

/** Where favorites used to be kept, shared by everyone using the browser. */
const LEGACY_STORAGE_KEY = 'jobs:favorites'

/**
 * The job postings the logged in candidate saved, stored in their account. Guests and
 * companies have no favorites. Changes show up at once and are undone if the API fails.
 */
export const useFavoritesStore = defineStore('favorites', () => {
  const auth = useAuthStore()
  const notifications = useNotificationsStore()

  const items = ref<FavoriteJob[]>([])
  let pending: Promise<void> | null = null

  try {
    localStorage.removeItem(LEGACY_STORAGE_KEY)
  } catch {
    // storage unavailable: nothing to clean up
  }

  const enabled = computed(() => auth.user?.role === 'candidate')
  const count = computed(() => items.value.length)

  function ensureLoaded() {
    if (!enabled.value) return Promise.resolve()

    pending ??= favoritesApi
      .listFavorites()
      .then((jobs) => {
        items.value = jobs.map(({ id, title, company }) => ({ id, title, company }))
      })
      .catch(() => {
        pending = null
      })

    return pending
  }

  // Another account (or none) after login/logout: load that account's favorites.
  watch(
    () => auth.user?.id,
    () => {
      items.value = []
      pending = null
      ensureLoaded()
    },
    { immediate: true },
  )

  function isFavorite(id: number) {
    return items.value.some((item) => item.id === id)
  }

  async function add(job: FavoriteJob) {
    const { id, title, company } = job
    items.value = [{ id, title, company: { name: company.name } }, ...items.value]

    try {
      await favoritesApi.addFavorite(id)
    } catch {
      items.value = items.value.filter((item) => item.id !== id)
      notifications.error('Impossibile salvare nei preferiti')
    }
  }

  async function remove(id: number) {
    const previous = items.value
    items.value = items.value.filter((item) => item.id !== id)

    try {
      await favoritesApi.removeFavorite(id)
    } catch {
      items.value = previous
      notifications.error('Impossibile rimuovere dai preferiti')
    }
  }

  function toggle(job: FavoriteJob) {
    return isFavorite(job.id) ? remove(job.id) : add(job)
  }

  return { items, enabled, count, ensureLoaded, isFavorite, toggle, remove }
})
