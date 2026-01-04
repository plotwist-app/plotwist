import type { FastifyRedis } from '@fastify/redis'
import RedisMock from 'ioredis-mock'

export const redisClient = new RedisMock() as unknown as FastifyRedis
