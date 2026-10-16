const currency = new Intl.NumberFormat('it-IT', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})
const currencyWithCents = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' })
const date = new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })

/** Formats in euros, showing cents only when the amount has them. */
export function formatCurrency(value: string | number) {
  const amount = Number(value)

  return (Number.isInteger(amount) ? currency : currencyWithCents).format(amount)
}

export function formatDate(iso: string) {
  return date.format(new Date(iso))
}
