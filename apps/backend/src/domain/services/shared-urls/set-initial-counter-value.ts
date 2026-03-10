import { logger } from '@/infra/adapters/logger'
import type { Counter } from '@/infra/ports/counter'

export async function setInitialCounterValue(
  counter: Counter,
  initialValue: number
): Promise<boolean> {
  const set = await counter.setInitialIfAbsent(initialValue)
  if (set) {
    logger.info({ startValue: initialValue }, 'Initialized shared URL counter')
  }
  return set
}
