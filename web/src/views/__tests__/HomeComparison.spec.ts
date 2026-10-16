import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, RouterLinkStub } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import { jobOf } from '@/__tests__/fixtures'
import { listJobPostings } from '@/services/jobPostings'
import { listSkills } from '@/services/skills'
import JobCard from '@/components/JobCard.vue'
import JobComparisonBar from '@/components/JobComparisonBar.vue'
import HomeView from '../HomeView.vue'

vi.mock('@/services/jobPostings')
vi.mock('@/services/skills')

describe('Home job comparison selection', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    setActivePinia(createPinia())
    vi.mocked(listSkills).mockResolvedValue([])
    vi.mocked(listJobPostings).mockResolvedValue({
      data: [jobOf(1), jobOf(2), jobOf(3), jobOf(4)],
      meta: { current_page: 1, last_page: 2, per_page: 4, total: 8, from: 1, to: 4 },
    })
  })

  it('limits selection to three and retains it when changing the results page', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', name: 'home', component: HomeView },
        { path: '/confronta', name: 'jobs.compare', component: { template: '<div />' } },
      ],
    })
    await router.push('/')
    const wrapper = mount(HomeView, {
      global: { plugins: [router], stubs: { RouterLink: RouterLinkStub } },
    })
    await flushPromises()
    const cards = wrapper.findAllComponents(JobCard)
    for (const card of cards.slice(0, 3)) {
      await card.get('button[aria-pressed]').trigger('click')
    }
    expect(cards[3]!.get('button[aria-pressed]').attributes('disabled')).toBeDefined()
    const bar = wrapper.getComponent(JobComparisonBar)
    expect(bar.props('jobs').map((job: { id: number }) => job.id)).toEqual([1, 2, 3])
    const link = bar.findAllComponents(RouterLinkStub)[0]!
    expect(link.props('to')).toEqual({ name: 'jobs.compare', query: { offerte: '1,2,3' } })
    await router.push({ query: { page: '2' } })
    await flushPromises()
    expect(bar.props('jobs')).toHaveLength(3)
    await bar.get('button[aria-label]').trigger('click')
    expect(cards[3]!.get('button[aria-pressed]').attributes('disabled')).toBeUndefined()
    await bar.get('button').trigger('click')
    expect(
      wrapper.find('section[aria-label="Offerte selezionate per il confronto"]').exists(),
    ).toBe(false)
  })
})
