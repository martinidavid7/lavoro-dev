import { beforeEach, describe, expect, it } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useFavoritasStore } from '@/stores/favoritas'
import type { Vaga } from '@/types/vaga'
import VagaCard from '../VagaCard.vue'

const vaga: Vaga = {
  id: 42,
  titulo: 'Desenvolvedor Vue Pleno',
  descricao: 'Trabalhar com Vue 3 e TypeScript.',
  salario: '9500.00',
  modalidade: 1,
  modalidade_label: 'Home Office',
  tipo: 2,
  tipo_label: 'PJ',
  publicacao: '2026-10-16T12:00:00-03:00',
  created_at: '2026-10-16T12:00:00-03:00',
  updated_at: '2026-10-16T12:00:00-03:00',
}

function montar() {
  return mount(VagaCard, {
    props: { vaga },
    global: { stubs: { RouterLink: RouterLinkStub } },
  })
}

describe('VagaCard', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('exibe os dados da vaga formatados', () => {
    const wrapper = montar()

    expect(wrapper.text()).toContain('Desenvolvedor Vue Pleno')
    expect(wrapper.text()).toContain('Home Office')
    expect(wrapper.text()).toContain('PJ')
    expect(wrapper.text()).toContain('16/10/2026')
    expect(wrapper.get('[data-test="salario"]').text().replace(/\s/g, ' ')).toBe('R$ 9.500,00')
  })

  it('favorita a vaga ao clicar na estrela', async () => {
    const wrapper = montar()
    const botao = wrapper.get('[data-test="favoritar"]')

    await botao.trigger('click')

    expect(useFavoritasStore().ehFavorita(42)).toBe(true)
    expect(botao.attributes('aria-pressed')).toBe('true')
  })

  it('emite excluir com a vaga', async () => {
    const wrapper = montar()

    await wrapper.get('button.btn-perigo').trigger('click')

    expect(wrapper.emitted('excluir')).toEqual([[vaga]])
  })
})
