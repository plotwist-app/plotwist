import { config } from '@/config'
import type { Config } from 'drizzle-kit'

export default {
  schema: 'src/db/schema/index.ts',
  out: 'priv/migrations',
  dialect: 'postgresql',
  dbCredentials: { url: config.db.DATABASE_URL },
  schemaFilter: ['auth', 'public'],
  migrations: {
    prefix: 'timestamp',
  },
} satisfies Config
