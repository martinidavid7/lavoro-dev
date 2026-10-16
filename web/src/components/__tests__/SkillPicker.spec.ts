import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { listSkills } from '@/services/skills'
import SkillPicker from '../SkillPicker.vue'

vi.mock('@/services/skills')

const catalog = [
  { id: 1, name: 'Docker' },
  { id: 2, name: 'PHP' },
  { id: 3, name: 'Vue.js' },
  { id: 4, name: 'Vite' },
]

async function mountPicker(selected: number[] = [], max?: number) {
  const wrapper = mount(SkillPicker, {
    props: {
      id: 'skills',
      modelValue: selected,
      max,
      'onUpdate:modelValue': (value: number[]) => wrapper.setProps({ modelValue: value }),
    },
  })
  await flushPromises()

  return wrapper
}

const optionNames = (wrapper: Awaited<ReturnType<typeof mountPicker>>) =>
  wrapper.findAll('[data-test="skill-option"]').map((option) => option.text())

describe('SkillPicker', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.mocked(listSkills).mockResolvedValue(catalog)
  })

  it('shows the selected skills as chips', async () => {
    const wrapper = await mountPicker([3, 2])

    const chips = wrapper.findAll('[data-test="selected-skill"] button')

    expect(chips.map((button) => button.attributes('aria-label'))).toEqual([
      'Rimuovi Vue.js',
      'Rimuovi PHP',
    ])
  })

  it('searches the catalog ignoring case, without the selected skills', async () => {
    const wrapper = await mountPicker([3])
    const input = wrapper.get('[data-test="skill-search"]')

    await input.setValue('v')

    expect(optionNames(wrapper)).toEqual(['Vite'])
  })

  it('adds a skill with the keyboard', async () => {
    const wrapper = await mountPicker()
    const input = wrapper.get('[data-test="skill-search"]')

    await input.setValue('p')
    await input.trigger('keydown', { key: 'Enter' })

    expect(wrapper.props('modelValue')).toEqual([2])
    expect((input.element as HTMLInputElement).value).toBe('')
  })

  it('adds a skill with the mouse', async () => {
    const wrapper = await mountPicker()

    await wrapper.get('[data-test="skill-search"]').trigger('focus')
    await wrapper.findAll('[data-test="skill-option"]')[0]!.trigger('mousedown')

    expect(wrapper.props('modelValue')).toEqual([1])
  })

  it('removes skills with the chip button or Backspace on the empty field', async () => {
    const wrapper = await mountPicker([1, 2, 3])

    await wrapper.get('[aria-label="Rimuovi PHP"]').trigger('click')
    expect(wrapper.props('modelValue')).toEqual([1, 3])

    await wrapper.get('[data-test="skill-search"]').trigger('keydown', { key: 'Backspace' })
    expect(wrapper.props('modelValue')).toEqual([1])
  })

  it('stops at the maximum number of skills', async () => {
    const wrapper = await mountPicker([1, 2], 2)
    const input = wrapper.get('[data-test="skill-search"]')

    expect(input.attributes('disabled')).toBeDefined()
    expect(input.attributes('placeholder')).toBe('Massimo 2 competenze')
  })
})
