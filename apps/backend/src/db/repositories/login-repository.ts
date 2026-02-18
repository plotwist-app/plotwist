import { or, sql } from 'drizzle-orm'
import { schema } from '@/db/schema'
import { withDbTracing } from '@/infra/telemetry/with-db-tracing'
import { db } from '..'

const findUserByEmailOrUsernameImpl = async (login?: string) => {
  const [user] = await db
    .select()
    .from(schema.users)
    .where(
      or(
        sql`LOWER(${schema.users.email}) = LOWER(${login ?? ''})`,
        sql`LOWER(${schema.users.username}) = LOWER(${login ?? ''})`
      )
    )

  return user
}

export const findUserByEmailOrUsername = withDbTracing(
  'find-user-by-email-or-username',
  findUserByEmailOrUsernameImpl
)
