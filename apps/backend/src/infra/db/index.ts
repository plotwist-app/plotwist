import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { config } from '@/config'

import * as schema from './schema'

export const client = postgres(config.db.DATABASE_URL)
export const db = drizzle(client, { schema })
