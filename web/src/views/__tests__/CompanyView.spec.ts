import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, RouterLinkStub } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { getCompany } from '@/services/companies'
import { ApiError } from '@/services/http'
import { listJobPostings } from '@/services/jobPostings'
import { useAuthStore } from '@/stores/auth'
import type { Company } from '@/types/company'
import CompanyView from '../CompanyView.vue'

vi.mock('@/services/companies')
vi.mock('@/services/jobPostings')

const company: Company = {
  id: 7,
  name: 'Martini Software',
  description: 'Software gestionale per le PMI.',
  sector: 'Software e SaaS',
  city: 'Bologna',
  size: '11-50',
  size_label: '11-50 dipendenti',
  website: 'https://www.example.com/',
  contact_email: 'info@example.com',
  phone: '+39 051 123 4567',
  logo_url: null,
  job_postings_count: 0,
}

const emptyPage = {
  data: [],
  meta: { current_page: 1, last_page: 1, per_page: 10, total: 0, from: null, to: null },
}

async function mountView() {
  const wrapper = mount(CompanyView, {
    props: { id: 7 },
    global: { stubs: { RouterLink: RouterLinkStub } },
  })
  await flushPromises()

  return wrapper
}

describe('CompanyView', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    setActivePinia(createPinia())
    vi.mocked(listJobPostings).mockResolvedValue(emptyPage)
  })

  it('shows the company details, contacts and loads its job postings', async () => {
    vi.mocked(getCompany).mockResolvedValue(company)

    const wrapper = await mountView()

    expect(wrapper.get('h1').text()).toBe('Martini Software')
    expect(wrapper.get('[data-test="facts"]').text()).toBe(
      'Software e SaaS · Bologna · 11-50 dipendenti',
    )
    expect(wrapper.text()).toContain('Software gestionale per le PMI.')
    expect(wrapper.get('a[href="mailto:info@example.com"]').text()).toBe('info@example.com')
    expect(wrapper.find('a[href="tel:+390511234567"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('example.com')
    expect(listJobPostings).toHaveBeenCalledWith({ company: 7, page: 1 })
  })

  it('only shows the edit button to the company itself', async () => {
    vi.mocked(getCompany).mockResolvedValue(company)

    expect((await mountView()).find('[data-test="edit-profile"]').exists()).toBe(false)

    useAuthStore().user = {
      id: 7,
      name: 'Martini Software',
      email: 'info@example.com',
      role: 'company',
      role_label: 'Azienda',
    }

    expect((await mountView()).find('[data-test="edit-profile"]').exists()).toBe(true)
  })

  it('handles a company without profile', async () => {
    vi.mocked(getCompany).mockResolvedValue({
      ...company,
      description: null,
      sector: null,
      city: null,
      size: null,
      size_label: null,
      website: null,
      contact_email: null,
      phone: null,
    })

    const wrapper = await mountView()

    expect(wrapper.find('[data-test="facts"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('Nessun contatto disponibile.')
  })

  it('shows a message for a missing company', async () => {
    vi.mocked(getCompany).mockRejectedValue(new ApiError(404, 'Not Found'))

    const wrapper = await mountView()

    expect(wrapper.text()).toContain('Questa azienda non esiste.')
    expect(listJobPostings).not.toHaveBeenCalled()
  })
})
