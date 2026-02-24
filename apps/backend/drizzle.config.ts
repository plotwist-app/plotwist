import type { Config } from 'drizzle-kit'

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required')
}

export default {
  schema: 'src/infra/db/schema/index.ts',
  out: 'src/infra/db/migrations',
  dialect: 'postgresql',
  dbCredentials: { url: DATABASE_URL },
  schemaFilter: ['auth', 'public'],
  migrations: {
    prefix: 'timestamp',
  },
} satisfies Config
