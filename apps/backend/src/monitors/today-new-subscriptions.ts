import { sql } from 'drizzle-orm'
import { db } from '@/infra/db'
import { schema } from '@/infra/db/schema'

export async function monitorTodayNewSubscriptions() {
  const [[{ count: totalNewSubscriptions }]] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.subscriptions)
      .where(
        sql`${schema.subscriptions.createdAt} > (date_trunc('day', now() AT TIME ZONE 'America/Sao_Paulo') AT TIME ZONE 'America/Sao_Paulo')`
      ),
  ])

  return totalNewSubscriptions
}
