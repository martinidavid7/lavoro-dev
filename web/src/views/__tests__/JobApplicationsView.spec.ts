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

  it('loads every status for the board even when the URL has a list filter', async () => {
    const { wrapper } = await mountView({ vista: 'kanban', stato: 'colloquio' })
    expect(listJobApplications).toHaveBeenLastCalledWith(42, undefined)
    expect(wrapper.findAll('[data-test="board-status"]')).toHaveLength(2)
    expect(wrapper.find('[data-test="status-tab"]').exists()).toBe(false)
    await wrapper.get('input[type="search"]').setValue('Sara')
    expect(wrapper.findAll('article')).toHaveLength(1)
    expect(wrapper.find('article')!.text()).toContain('Sara')
  })

  it('moves immediately and restores the original column if the API rejects the move', async () => {
    let rejectMove!: (error: Error) => void
    vi.mocked(updateApplicationStatus).mockImplementation(
      () =>
        new Promise((_, reject) => {
          rejectMove = reject
        }),
    )
    const { wrapper } = await mountView({ vista: 'kanban' })
    const columns = () => wrapper.findAll('section[aria-label]')
    await wrapper.findAll('[data-test="board-status"]')[0]!.setValue('hired')
    expect(columns()[3]!.text()).toContain('Marco')
    expect(columns()[0]!.findAll('article')).toHaveLength(0)
    rejectMove(new Error('Server unavailable'))
    await flushPromises()
    expect(columns()[0]!.text()).toContain('Marco')
    expect(columns()[3]!.findAll('article')).toHaveLength(0)
    expect(wrapper.findAll('[data-test="board-status"]')[0]!.attributes('disabled')).toBeUndefined()
  })

  it('keeps the board search and sort after a successful move', async () => {
    vi.mocked(updateApplicationStatus).mockResolvedValue(applicationOf(1, 'Marco', 'hired'))
    const { wrapper } = await mountView({ vista: 'kanban' })
    const sort = () => wrapper.get('select:not([data-test])').element as HTMLSelectElement
    const search = () => wrapper.get('input[type="search"]').element as HTMLInputElement
    await wrapper.get('select:not([data-test])').setValue('name')
    await wrapper.get('input[type="search"]').setValue('Mar')

    await wrapper.findAll('[data-test="board-status"]')[0]!.setValue('hired')
    await flushPromises()

    expect(listJobApplications).toHaveBeenCalledTimes(2)
    expect(search().value).toBe('Mar')
    expect(sort().value).toBe('name')
  })

  it('keeps the list on screen while switching status tab', async () => {
    let resolveReload!: (value: Awaited<ReturnType<typeof listJobApplications>>) => void
    const { wrapper, router } = await mountView()
    vi.mocked(listJobApplications).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveReload = resolve
        }),
    )

    await router.push({ query: { stato: 'colloquio' } })
    await flushPromises()

    expect(wrapper.findAll('article')).toHaveLength(2)
    expect(wrapper.get('[data-test="applications-content"]').attributes('aria-busy')).toBe('true')

    resolveReload({ data: [applicationOf(2, 'Sara', 'interview')], meta: { counts } })
    await flushPromises()

    expect(wrapper.findAll('article')).toHaveLength(1)
    expect(wrapper.get('[data-test="applications-content"]').attributes('aria-busy')).toBe('false')
  })

  it('supports dragging a candidate to another column', async () => {
    vi.mocked(updateApplicationStatus).mockResolvedValue(applicationOf(1, 'Marco', 'interview'))
    const { wrapper } = await mountView({ vista: 'kanban' })
    const data: Record<string, string> = {}
    const dataTransfer = {
      effectAllowed: '',
      setData: (key: string, value: string) => {
        data[key] = value
      },
      getData: (key: string) => data[key],
    }
    await wrapper.findAll('article')[0]!.trigger('dragstart', { dataTransfer })
    await wrapper.findAll('section[aria-label]')[1]!.trigger('drop', { dataTransfer })
    await flushPromises()
    expect(updateApplicationStatus).toHaveBeenCalledWith(1, 'interview')
  })
})
