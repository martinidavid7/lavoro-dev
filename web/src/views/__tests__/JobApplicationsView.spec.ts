import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, RouterLinkStub } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import { listJobApplications, updateApplicationStatus } from '@/services/applications'
import { ApiError } from '@/services/http'
import { getJobPosting } from '@/services/jobPostings'
import type { Application, ApplicationCounts } from '@/types/application'
import type { JobPosting } from '@/types/jobPosting'
import JobApplicationsView from '../JobApplicationsView.vue'

vi.mock('@/services/applications')
vi.mock('@/services/jobPostings')

const counts: ApplicationCounts = { in_review: 1, interview: 1, rejected: 0, hired: 0, all: 2 }

function applicationOf(id: number, name: string, status: Application['status']): Application {
  return {
    id,
    status,
    status_label: status,
    status_changed_at: null,
    cover_letter: null,
    cv_name: `CV ${name}.pdf`,
    created_at: '2026-10-16T12:00:00+02:00',
    candidate: {
      id: id + 100,
      name,
      email: `${name.toLowerCase()}@example.com`,
      phone: null,
      city: 'Milano',
      headline: 'Sviluppatore Vue',
      experience_years: 3,
      bio: null,
      photo_url: null,
      linkedin_url: null,
      github_url: null,
      portfolio_url: null,
      skills: [
        { id: 1, name: 'Vue.js' },
        { id: 9, name: 'Docker' },
      ],
    },
  }
}

async function mountView(query = {}) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/offerte/:id/candidature',
        name: 'jobs.applications',
        component: JobApplicationsView,
      },
      { path: '/offerte/:id', name: 'jobs.show', component: { template: '<div />' } },
    ],
  })
  await router.push({ path: '/offerte/42/candidature', query })

  const wrapper = mount(JobApplicationsView, {
    props: { id: 42 },
    global: { plugins: [router], stubs: { RouterLink: RouterLinkStub } },
  })
  await flushPromises()

  return { wrapper, router }
}

describe('JobApplicationsView', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    setActivePinia(createPinia())
    vi.mocked(getJobPosting).mockResolvedValue({
      id: 42,
      title: 'Sviluppatore Vue Senior',
      skills: [{ id: 1, name: 'Vue.js' }],
    } as JobPosting)
    vi.mocked(listJobApplications).mockResolvedValue({
      data: [applicationOf(1, 'Marco', 'in_review'), applicationOf(2, 'Sara', 'interview')],
      meta: { counts },
    })
  })

  it('lists the applicants with the counts per status', async () => {
    const { wrapper } = await mountView()

    expect(wrapper.text()).toContain('Sviluppatore Vue Senior')
    expect(wrapper.findAll('article')).toHaveLength(2)
    expect(wrapper.findAll('[data-test="status-tab"]').map((tab) => tab.text())).toEqual([
      'Tutte 2',
      'In valutazione 1',
      'Colloquio 1',
      'Non selezionato 0',
      'Assunto 0',
    ])
    expect(wrapper.get('[data-test="skills-match"]').text()).toBe('1 su 1 competenze richieste')
  })

  it('reads the status filter from the URL and changes it with the tabs', async () => {
    const { wrapper, router } = await mountView({ stato: 'colloquio' })

    expect(listJobApplications).toHaveBeenLastCalledWith(42, 'interview')

    await wrapper.findAll('[data-test="status-tab"]')[4]!.trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.query).toEqual({ stato: 'assunti' })
  })

  it('changes the status of an applicant and reloads the list', async () => {
    vi.mocked(updateApplicationStatus).mockResolvedValue(applicationOf(1, 'Marco', 'hired'))
    const { wrapper } = await mountView()

    await wrapper.findAll('[data-test="status-select"]')[0]!.setValue('hired')
    await flushPromises()

    expect(updateApplicationStatus).toHaveBeenCalledWith(1, 'hired')
    expect(listJobApplications).toHaveBeenCalledTimes(2)
  })

  it('tells other companies they cannot see the applicants', async () => {
    vi.mocked(listJobApplications).mockRejectedValue(new ApiError(403, 'Forbidden'))

    const { wrapper } = await mountView()

    expect(wrapper.text()).toContain('Puoi vedere solo i candidati delle tue offerte.')
  })
})
