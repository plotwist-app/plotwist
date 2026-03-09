import type { FastifyRedis } from '@fastify/redis'
import { logger } from '@/infra/adapters/logger'

export type SetInitialCounterValueInput = {
  redis: FastifyRedis
  counterKey: string
  /** Start value - 1 (e.g. 14_000_000 - 1). Counter is set to this; first INCR yields counterStartVal. */
  initialValue: number
}

/**
 * Set the initial counter value only if the key does not exist (SET NX).
 * For security, use a high initial value (e.g. 14_000_000 - 1) so short codes
 * are not guessable by the public.
 * Returns true if the key was set, false if it already existed.
 */
export async function setInitialCounterValue(
  input: SetInitialCounterValueInput
): Promise<boolean> {
  const { redis, counterKey, initialValue } = input
  const result = await redis.set(counterKey, String(initialValue), 'NX')

  const set = result === 'OK'
  if (set) {
    logger.info(
      { key: counterKey, startValue: initialValue },
      'Initialized Redis counter for shared URLs'
    )
  }
  return set
}
