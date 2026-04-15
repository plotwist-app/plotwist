import type { FastifyRedis } from '@fastify/redis'
import type { Counter } from '@/infra/ports/counter'

type Options = {
  redis: FastifyRedis
  counterKey: string
}

export function createRedisCounter({ redis, counterKey }: Options): Counter {
  return {
    async nextId() {
      const id = await redis.incr(counterKey)
      if (typeof id !== 'number') {
        throw new Error('Redis INCR did not return a number')
      }
      return id
    },

    async setInitialIfAbsent(initialValue: number) {
      const result = await redis.set(counterKey, String(initialValue), 'NX')
      return result === 'OK'
    },
  }
}
