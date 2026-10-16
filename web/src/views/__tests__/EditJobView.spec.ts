import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, RouterLinkStub } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { jobOf } from '@/__tests__/fixtures'
import { getJobPosting } from '@/services/jobPostings'
import { useAuthStore } from '@/stores/auth'
import EditJobView from '../EditJobView.vue'

vi.mock('@/services/jobPostings')

describe('EditJobView', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    setActivePinia(createPinia())
    useAuthStore().user = {
      id: 7,
      name: 'Acme',
      email: 'acme@example.com',
      role: 'company',
      role_label: 'Azienda',
    }
    vi.mocked(getJobPosting).mockResolvedValue(jobOf())
  })
  const mountView = () =>
    mount(EditJobView, {
      props: { id: 42 },
      global: { stubs: { RouterLink: RouterLinkStub, JobPostingForm: true } },
    })

  it('opens the form only for the owner', async () => {
    const wrapper = mountView()
    await flushPromises()
    expect(wrapper.find('job-posting-form-stub').exists()).toBe(true)
  })

  it('blocks another company from opening the editor', async () => {
    useAuthStore().user!.id = 99
    const wrapper = mountView()
    await flushPromises()
    expect(wrapper.find('job-posting-form-stub').exists()).toBe(false)
    expect(wrapper.get('[role="alert"]').text()).toContain('Puoi modificare solo le tue offerte')
  })
})
