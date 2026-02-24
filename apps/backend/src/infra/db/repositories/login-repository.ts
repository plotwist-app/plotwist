import { and, isNull, or, sql } from 'drizzle-orm'
import { schema } from '@/infra/db/schema'
import { db } from '..'

export async function findUserByEmailOrUsername(login?: string) {
  const [user] = await db
    .select()
    .from(schema.users)
    .where(
      and(
        or(
          sql`LOWER(${schema.users.email}) = LOWER(${login ?? ''})`,
          sql`LOWER(${schema.users.username}) = LOWER(${login ?? ''})`
        ),
        isNull(schema.users.deletedAt)
      )
    )

  return user
}
