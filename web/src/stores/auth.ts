import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import * as authApi from '@/services/auth'
import type { JobPosting } from '@/types/jobPosting'
import type { LoginPayload, RegisterPayload, User } from '@/types/user'

/**
 * The logged in user. The session lives in an HttpOnly cookie set by the API,
 * so the only way to know who is logged in is asking GET /api/user.
 */
export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  let pending: Promise<void> | null = null

  const isAuthenticated = computed(() => user.value !== null)
  const isCompany = computed(() => user.value?.role === 'company')

  /** Loads the session once; concurrent calls (e.g. several route guards) share the request. */
  function ensureLoaded() {
    pending ??= authApi
      .getCurrentUser()
      .then((current) => {
        user.value = current
      })
      .catch(() => {
        // API unreachable: treat as guest, and try again on the next navigation.
        pending = null
      })

    return pending
  }

  async function login(payload: LoginPayload) {
    user.value = await authApi.login(payload)

    return user.value
  }

  async function register(payload: RegisterPayload) {
    user.value = await authApi.register(payload)

    return user.value
  }

  async function logout() {
    await authApi.logout()
    user.value = null
  }

  /** Only the company that published a job posting can delete or edit it. */
  function canManage(job: { company: Pick<JobPosting['company'], 'id'> }) {
    return user.value?.id === job.company.id
  }

  return { user, isAuthenticated, isCompany, ensureLoaded, login, register, logout, canManage }
})
