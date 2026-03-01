import { logger } from '@/infra/adapters/logger'
import { client } from '.'

async function main() {
  logger.info('🌱 Database seeded!')
}

main()
  .catch(err => {
    logger.error('Database seed failed', err)
  })
  .finally(() => client.end())
