import { and, eq, sql } from 'drizzle-orm'
import type { InsertSocialLink } from '@/domain/entities/social-link'
import { withDbTracing } from '@/infra/telemetry/with-db-tracing'
import { db } from '..'
import { schema } from '../schema'

const insertSocialLinkImpl = async ({
  platform,
  url,
  userId,
}: InsertSocialLink) => {
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

export const insertSocialLink = withDbTracing(
  'insert-social-link',
  insertSocialLinkImpl
)

const deleteSocialLinkImpl = async (
  userId: string,
  platform: InsertSocialLink['platform']
) => {
  return db
    .delete(schema.socialLinks)
    .where(
      and(
        eq(schema.socialLinks.userId, userId),
        eq(schema.socialLinks.platform, platform)
      )
    )
}

export const deleteSocialLink = withDbTracing(
  'delete-social-link',
  deleteSocialLinkImpl
)

const selectSocialLinksImpl = async (userId: string) => {
  return db
    .select()
    .from(schema.socialLinks)
    .where(eq(schema.socialLinks.userId, userId))
}

export const selectSocialLinks = withDbTracing(
  'select-social-links',
  selectSocialLinksImpl
)
