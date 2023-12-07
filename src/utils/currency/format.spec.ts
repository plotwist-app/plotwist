import { expect, test } from 'vitest'
import { formatCurrency } from './format'

test('formatCurrency should format the amount in USD currency', () => {
  const amount = 1234567.89
  const result = formatCurrency(amount)

  expect(result).toBe('$1,234,567.89')
})

test('formatCurrency should handle decimal values correctly', () => {
  const amount = 1234.56
  const result = formatCurrency(amount)

  expect(result).toBe('$1,234.56')
})

test('formatCurrency should handle integer values correctly', () => {
  const amount = 987654
  const result = formatCurrency(amount)

  expect(result).toBe('$987,654')
})
