export function formmatCurrency(value: number, currency: string) {
  const decimalValue = value / 100;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(decimalValue);
}
