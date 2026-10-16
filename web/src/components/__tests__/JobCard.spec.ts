import { beforeEach, describe, expect, it } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useFavoritesStore } from '@/stores/favorites'
import type { JobPosting } from '@/types/jobPosting'
import type { User } from '@/types/user'
import JobCard from '../JobCard.vue'

const job: JobPosting = {
  id: 42,
  company: { id: 7, name: 'Acme S.r.l.' },
  title: 'Sviluppatore Vue Mid',
  description: 'Lavorare con Vue 3 e TypeScript.',
  salary: '42000.00',
  work_mode: 3,
  work_mode_label: 'Ibrido',
  contract_type: 1,
  contract_type_label: 'Tempo indeterminato',
  published_at: '2026-10-16T12:00:00+02:00',
  created_at: '2026-10-16T12:00:00+02:00',
  updated_at: '2026-10-16T12:00:00+02:00',
}

const company = (id: number): User => ({
  id,
  name: 'Azienda',
  email: `azienda${id}@example.com`,
  role: 'company',
  role_label: 'Azienda',
})

function mountCard() {
  return mount(JobCard, {
    props: { job },
    global: { stubs: { RouterLink: RouterLinkStub } },
  })
}

describe('JobCard', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('renders the formatted job posting data', () => {
    const wrapper = mountCard()

    expect(wrapper.text()).toContain('Sviluppatore Vue Mid')
    expect(wrapper.get('[data-test="company"]').text()).toBe('Acme S.r.l.')
    expect(wrapper.text()).toContain('Ibrido')
    expect(wrapper.text()).toContain('Tempo indeterminato')
    expect(wrapper.text()).toContain('16/10/2026')
    expect(wrapper.get('[data-test="salary"]').text().replace(/\s/g, ' ')).toBe('42.000 €')
  })

  it('marks the job posting as favorite when the star is clicked', async () => {
    const wrapper = mountCard()
    const button = wrapper.get('[data-test="favorite"]')

    await button.trigger('click')

    expect(useFavoritesStore().isFavorite(42)).toBe(true)
    expect(button.attributes('aria-pressed')).toBe('true')
  })

  it('hides the delete button from guests and other companies', () => {
    expect(mountCard().find('button.btn-danger').exists()).toBe(false)

    useAuthStore().user = company(99)

    expect(mountCard().find('button.btn-danger').exists()).toBe(false)
  })

  it('lets the owner delete it', async () => {
    useAuthStore().user = company(7)
    const wrapper = mountCard()

    await wrapper.get('button.btn-danger').trigger('click')

    expect(wrapper.emitted('delete')).toEqual([[job]])
  })
})
