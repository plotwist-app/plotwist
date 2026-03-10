import { describe, expect, it } from 'vitest'
import { createInMemoryCounter } from '@/test/mocks/counter'
import { setInitialCounterValue } from './set-initial-counter-value'

describe('setInitialCounterValue', () => {
  it('should set the counter when not yet initialized', async () => {
    const counter = createInMemoryCounter()

    const set = await setInitialCounterValue(counter, 100)
    expect(set).toBe(true)

    const next = await counter.nextId()
    expect(next).toBe(101)
  })

  it('should not overwrite once already set', async () => {
    const counter = createInMemoryCounter()

    const first = await setInitialCounterValue(counter, 100)
    expect(first).toBe(true)

    const second = await setInitialCounterValue(counter, 999)
    expect(second).toBe(false)
  })
})
