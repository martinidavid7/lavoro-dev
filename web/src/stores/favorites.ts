import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import type { JobPosting } from '@/types/jobPosting'

export type FavoriteJob = Pick<JobPosting, 'id' | 'title'>

const STORAGE_KEY = 'jobs:favorites'

function load(): FavoriteJob[] {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')

    return Array.isArray(saved) ? saved : []
  } catch {
    return []
  }
}

/** Job postings the user marked as favorite, persisted in localStorage. */
export const useFavoritesStore = defineStore('favorites', () => {
  const items = ref<FavoriteJob[]>(load())

  watch(
    items,
    (value) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
      } catch {
        // storage unavailable (private mode, quota exceeded): keep it in memory only
      }
    },
    { deep: true },
  )

  const count = computed(() => items.value.length)

  function isFavorite(id: number) {
    return items.value.some((item) => item.id === id)
  }

  function remove(id: number) {
    items.value = items.value.filter((item) => item.id !== id)
  }

  function toggle({ id, title }: FavoriteJob) {
    if (isFavorite(id)) remove(id)
    else items.value.push({ id, title })
  }

  return { items, count, isFavorite, toggle, remove }
})
