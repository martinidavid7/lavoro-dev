import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { JobPosting } from '@/types/jobPosting'

export const MAX_COMPARED_JOBS = 3

/**
 * The job postings picked for comparison. Kept in a store, not in the job list page,
 * so the selection survives opening a job posting and coming back.
 */
export const useComparisonStore = defineStore('comparison', () => {
  const jobs = ref<JobPosting[]>([])

  const isFull = computed(() => jobs.value.length >= MAX_COMPARED_JOBS)

  function isSelected(id: number) {
    return jobs.value.some((job) => job.id === id)
  }

  function remove(id: number) {
    jobs.value = jobs.value.filter((job) => job.id !== id)
  }

  function toggle(job: JobPosting) {
    if (isSelected(job.id)) remove(job.id)
    else if (!isFull.value) jobs.value = [...jobs.value, job]
  }

  function clear() {
    jobs.value = []
  }

  return { jobs, isFull, isSelected, toggle, remove, clear }
})
