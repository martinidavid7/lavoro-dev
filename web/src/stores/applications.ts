import { ref, watch } from 'vue'
import { defineStore } from 'pinia'
import * as applicationsApi from '@/services/applications'
import type { Application } from '@/types/application'
import { useAuthStore } from './auth'

/**
 * The logged in candidate's applications: the "Le mie candidature" page, and the
 * job posting page, which shows whether the candidate already applied.
 */
export const useApplicationsStore = defineStore('applications', () => {
  const auth = useAuthStore()

  const items = ref<Application[]>([])
  const loaded = ref(false)
  let pending: Promise<void> | null = null

  // Another account (or none) after login/logout: forget the previous applications.
  watch(
    () => auth.user?.id,
    () => {
      items.value = []
      loaded.value = false
      pending = null
    },
  )

  /** Loads the applications once, only for candidates. */
  function ensureLoaded() {
    if (auth.user?.role !== 'candidate') return Promise.resolve()

    pending ??= applicationsApi
      .listMyApplications()
      .then((applications) => {
        items.value = applications
        loaded.value = true
      })
      .catch((e) => {
        pending = null
        throw e
      })

    return pending
  }

  function forJob(jobPostingId: number) {
    return items.value.find((application) => application.job_posting?.id === jobPostingId)
  }

  async function apply(jobPostingId: number, coverLetter: string | null) {
    const application = await applicationsApi.applyToJob(jobPostingId, coverLetter)
    items.value = [application, ...items.value]

    return application
  }

  async function withdraw(id: number) {
    await applicationsApi.withdrawApplication(id)
    items.value = items.value.filter((application) => application.id !== id)
  }

  return { items, loaded, ensureLoaded, forJob, apply, withdraw }
})
