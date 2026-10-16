import type { JobPosting } from '@/types/jobPosting'
import { http } from './http'

/** The logged in candidate's favorite job postings, most recently saved first. */
export async function listFavorites() {
  const { data } = await http<{ data: JobPosting[] }>('/favorites')

  return data
}

export function addFavorite(jobPostingId: number) {
  return http<void>(`/favorites/${jobPostingId}`, { method: 'PUT' })
}

export function removeFavorite(jobPostingId: number) {
  return http<void>(`/favorites/${jobPostingId}`, { method: 'DELETE' })
}
