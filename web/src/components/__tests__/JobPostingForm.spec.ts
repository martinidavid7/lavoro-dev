import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import { jobOf } from '@/__tests__/fixtures'
import { createJobPosting, updateJobPosting } from '@/services/jobPostings'
import { ApiError } from '@/services/http'
import { useSkillsStore } from '@/stores/skills'
import JobPostingForm from '../JobPostingForm.vue'

vi.mock('@/services/jobPostings')

async function mountForm(edit = false) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div />' } },
      { path: '/offerte/:id', name: 'jobs.show', component: { template: '<div />' } },
    ],
  })
  await router.push('/')
  const wrapper = mount(JobPostingForm, {
    props: edit ? { initialJob: jobOf() } : {},
    global: { plugins: [router], stubs: { SkillPicker: true } },
  })
  return { wrapper, router }
}

describe('JobPostingForm', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    setActivePinia(createPinia())
    useSkillsStore().items = [{ id: 1, name: 'Vue.js' }]
  })

  it('preloads an existing job and updates its live preview before saving via PATCH', async () => {
    vi.mocked(updateJobPosting).mockResolvedValue(jobOf(42, { title: 'Vue Senior' }))
    const { wrapper, router } = await mountForm(true)
    expect((wrapper.get('#title').element as HTMLInputElement).value).toBe('Sviluppatore Vue 42')
    await wrapper.get('#title').setValue('Vue Senior')
    expect(wrapper.get('aside').text()).toContain('Vue Senior')
    expect(wrapper.get('aside').text()).toContain('Vue.js')
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(updateJobPosting).toHaveBeenCalledWith(42, {
      title: 'Vue Senior',
      description: jobOf().description,
      salary: 42000,
      work_mode: 1,
      contract_type: 1,
      skills: [1],
    })
    expect(createJobPosting).not.toHaveBeenCalled()
    expect(router.currentRoute.value.name).toBe('jobs.show')
  })

  it('still creates a job from the shared form', async () => {
    vi.mocked(createJobPosting).mockResolvedValue(jobOf())
    const { wrapper } = await mountForm()
    await wrapper.get('#title').setValue('Nuova offerta')
    await wrapper.get('#description').setValue('Descrizione')
    await wrapper.get('#salary').setValue('50000')
    await wrapper.get('#work_mode').setValue(1)
    await wrapper.get('#contract_type').setValue(1)
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(createJobPosting).toHaveBeenCalledWith({
      title: 'Nuova offerta',
      description: 'Descrizione',
      salary: 50000,
      work_mode: 1,
      contract_type: 1,
      skills: [],
    })
    expect(updateJobPosting).not.toHaveBeenCalled()
  })

  it('keeps the user input and displays server validation errors without leaving', async () => {
    vi.mocked(updateJobPosting).mockRejectedValue(
      new ApiError(422, 'Invalid', { title: ['Titolo non valido'] }),
    )
    const { wrapper, router } = await mountForm(true)
    await wrapper.get('#title').setValue('Modifica da conservare')
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(wrapper.text()).toContain('Titolo non valido')
    expect((wrapper.get('#title').element as HTMLInputElement).value).toBe('Modifica da conservare')
    expect(router.currentRoute.value.path).toBe('/')
    expect(wrapper.get('button[type="submit"]').attributes('disabled')).toBeUndefined()
  })
})
