import { beforeEach, describe, expect, it } from 'vitest'
import { redisClient } from '@/test/mocks/redis'
import { setInitialCounterValue } from './set-initial-counter-value'

const COUNTER_KEY = 'test:set_initial_counter:counter'

describe('setInitialCounterValue', () => {
  beforeEach(async () => {
    await redisClient.del(COUNTER_KEY)
  })

  it('should set the counter when key does not exist', async () => {
    const set = await setInitialCounterValue({
      redis: redisClient,
      counterKey: COUNTER_KEY,
      initialValue: 100,
    })

    expect(set).toBe(true)

    const value = await redisClient.get(COUNTER_KEY)
    expect(Number(value)).toBe(100)
  })

  it('should not overwrite if the key already exists', async () => {
    await redisClient.set(COUNTER_KEY, '500')

    const set = await setInitialCounterValue({
      redis: redisClient,
      counterKey: COUNTER_KEY,
      initialValue: 100,
    })

    expect(set).toBe(false)

    const value = await redisClient.get(COUNTER_KEY)
    expect(Number(value)).toBe(500)
  })

  it('should allow INCR after initial set', async () => {
    await setInitialCounterValue({
      redis: redisClient,
      counterKey: COUNTER_KEY,
      initialValue: 100,
    })

    const next = await redisClient.incr(COUNTER_KEY)
    expect(next).toBe(101)
  })
})
