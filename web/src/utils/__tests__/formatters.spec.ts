import { describe, expect, it } from 'vitest'
import { formatCurrency, formatDate } from '../formatters'

// Intl uses a non-breaking space between the amount and "€".
const normalize = (text: string) => text.replace(/\s/g, ' ')

describe('formatCurrency', () => {
  it('formats numbers and API decimal strings in euros', () => {
    expect(normalize(formatCurrency(42000))).toBe('42.000 €')
    expect(normalize(formatCurrency('35000.00'))).toBe('35.000 €')
  })

  it('shows cents only when the amount has them', () => {
    expect(normalize(formatCurrency('42000.50'))).toBe('42.000,50 €')
  })
})

describe('formatDate', () => {
  it('formats ISO dates in the Italian format', () => {
    expect(formatDate('2026-10-16T12:00:00+02:00')).toBe('16/10/2026')
  })
})
