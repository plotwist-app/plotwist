import { sql } from 'drizzle-orm'
import { db } from '@/infra/db'
import { schema } from '@/infra/db/schema'

export async function monitorTotalSubscriptions() {
  const [[{ count: totalSubscriptions }]] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(schema.subscriptions),
  ])

  return totalSubscriptions
}
