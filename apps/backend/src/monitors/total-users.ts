import { sql } from 'drizzle-orm'
import { db } from '@/infra/db'
import { schema } from '@/infra/db/schema'

export async function monitorTotalUsers() {
  const [[{ count: totalUsers }]] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(schema.users),
  ])

  return totalUsers
}
