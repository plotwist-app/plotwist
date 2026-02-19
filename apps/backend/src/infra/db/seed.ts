import { logger } from '@/infra/adapters/logger'
import { client } from '.'

async function main() {
  logger.info('🌱 Database seeded!')
}

main()
  .catch(err => console.error(err))
  .finally(() => client.end())
