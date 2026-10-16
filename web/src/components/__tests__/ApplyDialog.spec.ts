import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, RouterLinkStub } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { applyToJob } from '@/services/applications'
import { ApiError } from '@/services/http'
import { useApplicationsStore } from '@/stores/applications'
import { useAuthStore } from '@/stores/auth'
import { useCandidateStore } from '@/stores/candidate'
import type { Application } from '@/types/application'
import type { CandidateProfile } from '@/types/candidate'
import ApplyDialog from '../ApplyDialog.vue'

vi.mock('@/services/applications')

const job = { id: 42, title: 'Sviluppatore Vue', company: { id: 7, name: 'Acme', logo_url: null } }

const profile: CandidateProfile = {
  id: 3,
  name: 'Giulia Rossi',
  email: 'giulia@example.com',
  phone: null,
  city: null,
  headline: null,
  experience_years: null,
  bio: null,
  linkedin_url: null,
  github_url: null,
  portfolio_url: null,
  photo_url: null,
  cv: { name: 'CV Giulia.pdf', updated_at: '2026-10-16T12:00:00+02:00' },
  skills: [],
}

const sent: Application = {
  id: 1,
  status: 'in_review',
  status_label: 'In valutazione',
  status_changed_at: null,
  cover_letter: 'Mi interessa!',
  cv_name: 'CV Giulia.pdf',
  created_at: '2026-10-16T12:00:00+02:00',
  job_posting: { id: 42, title: 'Sviluppatore Vue', company: job.company },
}

function mountDialog() {
  return mount(ApplyDialog, {
    props: { job, open: true },
    global: { stubs: { RouterLink: RouterLinkStub } },
  })
}

describe('ApplyDialog', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    setActivePinia(createPinia())
    useAuthStore().user = {
      id: 3,
      name: 'Giulia Rossi',
      email: 'giulia@example.com',
      role: 'candidate',
      role_label: 'Candidato',
    }
  })

  it('asks for a CV before applying', () => {
    useCandidateStore().set({ ...profile, cv: null })

    const wrapper = mountDialog()

    expect(wrapper.find('[data-test="cv-missing"]').exists()).toBe(true)
    expect(wrapper.find('form').exists()).toBe(false)
  })

  it('sends the application with the cover letter and closes', async () => {
    useCandidateStore().set(profile)
    vi.mocked(applyToJob).mockResolvedValue(sent)
    const wrapper = mountDialog()

    expect(wrapper.get('[data-test="cv-to-send"]').text()).toContain('CV Giulia.pdf')

    await wrapper.get('textarea').setValue('  Mi interessa!  ')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(applyToJob).toHaveBeenCalledWith(42, 'Mi interessa!')
    expect(useApplicationsStore().forJob(42)).toEqual(sent)
    expect(wrapper.emitted('update:open')).toEqual([[false]])
  })

  it('shows the API error when the candidate already applied', async () => {
    useCandidateStore().set(profile)
    vi.mocked(applyToJob).mockRejectedValue(
      new ApiError(422, 'Errore', { job_posting: ['Ti sei già candidato a questa offerta.'] }),
    )
    const wrapper = mountDialog()

    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).toBe('Ti sei già candidato a questa offerta.')
    expect(wrapper.emitted('update:open')).toBeUndefined()
  })
})
