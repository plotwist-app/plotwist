import type { Config } from 'drizzle-kit'
import { config } from '@/config'

export default {
  schema: 'src/db/schema/index.ts',
  out: 'src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: { url: config.db.DATABASE_URL },
  schemaFilter: ['auth', 'public'],
  migrations: {
    prefix: 'timestamp',
  },
} satisfies Config
