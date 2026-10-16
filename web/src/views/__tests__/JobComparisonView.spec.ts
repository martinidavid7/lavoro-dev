import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, RouterLinkStub } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import { jobOf } from '@/__tests__/fixtures'
import { getJobPosting } from '@/services/jobPostings'
import JobComparisonView from '../JobComparisonView.vue'

vi.mock('@/services/jobPostings')

async function mountView(offerte = '1,2') {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/confronta', component: JobComparisonView },
      { path: '/', name: 'home', component: { template: '<div />' } },
      { path: '/offerte/:id', name: 'jobs.show', component: { template: '<div />' } },
    ],
  })
  await router.push({ path: '/confronta', query: { offerte } })
  const wrapper = mount(JobComparisonView, {
    global: { plugins: [router], stubs: { RouterLink: RouterLinkStub } },
  })
  await flushPromises()
  return { wrapper, router }
}

describe('JobComparisonView', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    setActivePinia(createPinia())
    vi.mocked(getJobPosting).mockImplementation(async (id) =>
      jobOf(id, { salary: id === 1 ? '50000' : '42000' }),
    )
  })

  it('compares the URL selection and hides identical rows on request', async () => {
    const { wrapper } = await mountView()
    expect(wrapper.text()).toContain('Sviluppatore Vue 1')
    expect(wrapper.text()).toContain('Sviluppatore Vue 2')
    expect(wrapper.text()).toContain('RAL più alta')
    await wrapper.get('input[type="checkbox"]').setValue(true)
    expect(wrapper.findAll('tbody tr')).toHaveLength(1)
    expect(wrapper.get('tbody').text()).toContain('Retribuzione annua lorda')
  })

  it('deduplicates and validates the URL, limiting requests to three jobs', async () => {
    await mountView('1,1,no,0,-1,2,3,4')
    expect(vi.mocked(getJobPosting).mock.calls.map(([id]) => id)).toEqual([1, 2, 3])
  })

  it('keeps available jobs visible when one cannot be loaded, and allows retry', async () => {
    vi.mocked(getJobPosting).mockRejectedValueOnce(new Error('Unavailable'))
    const { wrapper } = await mountView()
    expect(wrapper.get('[role="alert"]').text()).toContain('1 offerte')
    expect(wrapper.text()).toContain('Sviluppatore Vue 2')
    await wrapper.get('[role="alert"] button').trigger('click')
    await flushPromises()
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.findAll('thead th')).toHaveLength(3)
  })

  it('removes a job from the URL and handles an empty selection', async () => {
    const { wrapper, router } = await mountView()
    await wrapper.get('thead button').trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.query.offerte).toBe('2')
    await router.replace({ query: {} })
    await flushPromises()
    expect(wrapper.find('table').exists()).toBe(false)
    expect(wrapper.text()).toContain('Seleziona almeno due offerte')
  })
})
