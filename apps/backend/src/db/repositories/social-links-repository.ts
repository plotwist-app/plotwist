import type { InsertSocialLink } from '@/domain/entities/social-link'
import { and, eq, sql } from 'drizzle-orm'
import { db } from '..'
import { schema } from '../schema'

export async function insertSocialLink({
  platform,
  url,
  userId,
}: InsertSocialLink) {
  return db.execute(
    sql`
      INSERT INTO ${schema.socialLinks} (user_id, platform, url)
      VALUES (${userId}, ${platform}, ${url})
      ON CONFLICT (user_id, platform)
      DO UPDATE SET url = ${url}
      RETURNING *
    `
  )
}

export async function deleteSocialLink(
  userId: string,
  platform: InsertSocialLink['platform']
) {
  return db
    .delete(schema.socialLinks)
    .where(
      and(
        eq(schema.socialLinks.userId, userId),
        eq(schema.socialLinks.platform, platform)
      )
    )
}

export async function selectSocialLinks(userId: string) {
  return db
    .select()
    .from(schema.socialLinks)
    .where(eq(schema.socialLinks.userId, userId))
}
