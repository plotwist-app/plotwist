import { expect, test } from 'vitest'
import { formatCurrency } from './format'
import { Locale } from '../../../locales'

test('formatCurrency should format the amount in USD currency (default locale)', () => {
  const amount = 1234567.89
  const result = formatCurrency(amount)

  expect(result).toBe('$1,234,567.89')
})

test.each([
  [1234567.89, 'es-ES', '1.234.567,89 €'],
  [1234.56, 'fr-FR', '1 234,56 €'],
  [987654, 'de-DE', '987.654 €'],
  [5678, 'it-IT', '5.678 €'],
  [12345.67, 'pt-BR', 'R$ 12.345,67'],
])(
  'formatCurrency should format the amount in the correct currency for the specified locale',
  (amount, locale, expected) => {
    const result = formatCurrency(amount, locale as Locale)

    const formattedResult = result
      .replaceAll(/\u00a0/g, ' ')
      .replaceAll(/\u202f/g, ' ')

    expect(formattedResult).toBe(expected)
  },
)

test('formatCurrency should handle decimal values correctly (default locale)', () => {
  const amount = 1234.56
  const result = formatCurrency(amount)

  expect(result).toBe('$1,234.56')
})

test('formatCurrency should handle integer values correctly (default locale)', () => {
  const amount = 987654
  const result = formatCurrency(amount)

  expect(result).toBe('$987,654')
})
