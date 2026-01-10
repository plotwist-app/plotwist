import { or, sql } from 'drizzle-orm'
import { schema } from '@/db/schema'
import { db } from '..'

export async function findUserByEmailOrUsername(login?: string) {
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
