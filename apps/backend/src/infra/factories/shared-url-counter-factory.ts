import type { FastifyRedis } from '@fastify/redis'
import { createRedisCounter } from '@/infra/adapters/redis-counter'
import type { Counter } from '@/infra/ports/counter'

export function sharedUrlCounterFactory(
  redis: FastifyRedis,
  counterKey: string
): Counter {
  return createRedisCounter({ redis, counterKey })
}
