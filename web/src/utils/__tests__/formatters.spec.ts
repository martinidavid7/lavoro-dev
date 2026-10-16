import { describe, expect, it } from 'vitest'
import { formatarData, formatarMoeda } from '../formatters'

// Intl usa espaço não separável entre "R$" e o valor.
const normalizar = (texto: string) => texto.replace(/\s/g, ' ')

describe('formatarMoeda', () => {
  it('formata valores numéricos e strings decimais da API em reais', () => {
    expect(normalizar(formatarMoeda(8500.5))).toBe('R$ 8.500,50')
    expect(normalizar(formatarMoeda('12000.00'))).toBe('R$ 12.000,00')
  })
})

describe('formatarData', () => {
  it('formata datas ISO no padrão brasileiro', () => {
    expect(formatarData('2026-10-16T12:00:00-03:00')).toBe('16/10/2026')
  })
})
