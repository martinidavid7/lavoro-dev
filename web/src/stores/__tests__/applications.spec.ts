import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import * as applicationsApi from '@/services/applications'
import type { Application } from '@/types/application'
import type { User } from '@/types/user'
import { useApplicationsStore } from '../applications'
import { useAuthStore } from '../auth'

vi.mock('@/services/applications')

const candidate: User = {
  id: 3,
  name: 'Giulia Rossi',
  email: 'giulia@example.com',
  role: 'candidate',
  role_label: 'Candidato',
}

const application: Application = {
  id: 1,
  status: 'interview',
  status_label: 'Colloquio',
  status_changed_at: null,
  cover_letter: null,
  cv_name: 'CV.pdf',
  created_at: '2026-10-16T12:00:00+02:00',
  job_posting: {
    id: 42,
    title: 'Sviluppatore Vue',
    company: { id: 7, name: 'Acme', logo_url: null },
  },
}

describe('applications store', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    setActivePinia(createPinia())
  })

  it('loads the candidate applications once and finds them by job posting', async () => {
    useAuthStore().user = candidate
    vi.mocked(applicationsApi.listMyApplications).mockResolvedValue([application])
    const applications = useApplicationsStore()

    await Promise.all([applications.ensureLoaded(), applications.ensureLoaded()])

    expect(applicationsApi.listMyApplications).toHaveBeenCalledOnce()
    expect(applications.forJob(42)).toEqual(application)
    expect(applications.forJob(99)).toBeUndefined()
  })

  it('does not load anything for companies and guests', async () => {
    await useApplicationsStore().ensureLoaded()

    useAuthStore().user = { ...candidate, role: 'company', role_label: 'Azienda' }
    await useApplicationsStore().ensureLoaded()

    expect(applicationsApi.listMyApplications).not.toHaveBeenCalled()
  })

  it('withdraws an application', async () => {
    useAuthStore().user = candidate
    vi.mocked(applicationsApi.listMyApplications).mockResolvedValue([application])
    const applications = useApplicationsStore()
    await applications.ensureLoaded()

    await applications.withdraw(1)

    expect(applicationsApi.withdrawApplication).toHaveBeenCalledWith(1)
    expect(applications.items).toEqual([])
  })

  it('forgets the applications when the user logs out', async () => {
    const auth = useAuthStore()
    auth.user = candidate
    vi.mocked(applicationsApi.listMyApplications).mockResolvedValue([application])
    const applications = useApplicationsStore()
    await applications.ensureLoaded()

    auth.user = null
    await nextTick()

    expect(applications.items).toEqual([])
    expect(applications.loaded).toBe(false)
  })
})
