import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { getCandidateProfile } from '@/services/candidateProfile'
import type { CandidateProfile } from '@/types/candidate'
import { useAuthStore } from './auth'

/**
 * The logged in candidate's profile. Its skills are used across the app: to filter
 * the job postings and to highlight the matching skills on each of them.
 */
export const useCandidateStore = defineStore('candidate', () => {
  const auth = useAuthStore()

  const profile = ref<CandidateProfile | null>(null)
  let pending: Promise<void> | null = null

  const skillIds = computed(() => profile.value?.skills.map((skill) => skill.id) ?? [])

  // Another account (or none) after login/logout: forget the previous profile.
  watch(
    () => auth.user?.id,
    () => {
      profile.value = null
      pending = null
    },
  )

  /** Loads the profile once, only for candidates. */
  function ensureLoaded() {
    if (auth.user?.role !== 'candidate') return Promise.resolve()

    pending ??= getCandidateProfile()
      .then((data) => {
        profile.value = data
      })
      .catch((e) => {
        pending = null
        throw e
      })

    return pending
  }

  /** Replaces the profile with the API's latest response (after saving or uploading). */
  function set(data: CandidateProfile) {
    profile.value = data
    pending = Promise.resolve()

    if (auth.user) auth.user.name = data.name
  }

  function hasSkill(id: number) {
    return skillIds.value.includes(id)
  }

  return { profile, skillIds, ensureLoaded, set, hasSkill }
})
