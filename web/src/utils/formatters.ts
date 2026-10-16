const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const data = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })

export function formatarMoeda(valor: string | number) {
  return moeda.format(Number(valor))
}

export function formatarData(iso: string) {
  return data.format(new Date(iso))
}
