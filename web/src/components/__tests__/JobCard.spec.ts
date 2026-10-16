import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, RouterLinkStub } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { routeLocationKey } from 'vue-router'
import { addFavorite, listFavorites } from '@/services/favorites'
import { useAuthStore } from '@/stores/auth'
import { useCandidateStore } from '@/stores/candidate'
import { useFavoritesStore } from '@/stores/favorites'
import type { JobPosting } from '@/types/jobPosting'
import type { User } from '@/types/user'
import JobCard from '../JobCard.vue'

vi.mock('@/services/favorites')

const job: JobPosting = {
  id: 42,
  company: { id: 7, name: 'Acme S.r.l.', logo_url: null },
  title: 'Sviluppatore Vue Mid',
  description: 'Lavorare con Vue 3 e TypeScript.',
  salary: '42000.00',
  work_mode: 3,
  work_mode_label: 'Ibrido',
  contract_type: 1,
  contract_type_label: 'Tempo indeterminato',
  skills: [
    { id: 1, name: 'PHP' },
    { id: 2, name: 'Vue.js' },
  ],
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

const candidateUser: User = {
  id: 3,
  name: 'Giulia Rossi',
  email: 'giulia@example.com',
  role: 'candidate',
  role_label: 'Candidato',
}

function mountCard() {
  return mount(JobCard, {
    props: { job },
    global: {
      stubs: { RouterLink: RouterLinkStub },
      provide: { [routeLocationKey as symbol]: { fullPath: '/' } },
    },
  })
}

describe('JobCard', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(listFavorites).mockResolvedValue([])
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

  it("highlights the candidate's skills first", () => {
    useAuthStore().user = {
      id: 3,
      name: 'Giulia Rossi',
      email: 'giulia@example.com',
      role: 'candidate',
      role_label: 'Candidato',
    }
    useCandidateStore().set({
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
      cv: null,
      skills: [{ id: 2, name: 'Vue.js' }],
    })

    const skills = mountCard().findAll('li')

    expect(skills.map((li) => li.text().replace(/\s+/g, ' '))).toEqual([
      'Hai questa competenza: Vue.js',
      'PHP',
    ])
    expect(skills[0]?.attributes('data-test')).toBe('matching-skill')
  })

  it("saves the job posting in the candidate's favorites when the star is clicked", async () => {
    useAuthStore().user = candidateUser
    const wrapper = mountCard()
    await flushPromises()
    const button = wrapper.get('[data-test="favorite"]')

    await button.trigger('click')

    expect(addFavorite).toHaveBeenCalledWith(42)
    expect(useFavoritesStore().isFavorite(42)).toBe(true)
    expect(button.attributes('aria-pressed')).toBe('true')
  })

  it('sends guests to the login page from the star, and hides it from companies', () => {
    const asGuest = mountCard()
    expect(asGuest.find('[data-test="favorite"]').exists()).toBe(false)
    expect(asGuest.find('[data-test="favorite-login"]').exists()).toBe(true)

    useAuthStore().user = company(99)
    const asCompany = mountCard()
    expect(asCompany.find('[data-test="favorite"]').exists()).toBe(false)
    expect(asCompany.find('[data-test="favorite-login"]').exists()).toBe(false)
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
