import { sql } from 'drizzle-orm'
import { db } from '@/infra/db'
import { schema } from '@/infra/db/schema'

export async function monitorTodayNewUsers() {
  const [[{ count: totalNewUsers }]] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.users)
      .where(
        sql`${schema.users.createdAt} > (date_trunc('day', now() AT TIME ZONE 'America/Sao_Paulo') AT TIME ZONE 'America/Sao_Paulo')`
      ),
  ])

  return totalNewUsers
}
