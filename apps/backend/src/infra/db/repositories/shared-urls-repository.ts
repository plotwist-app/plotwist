import { eq } from 'drizzle-orm'
import type { SharedUrl } from '@/domain/entities/shared-urls'
import { db } from '..'
import { schema } from '../schema'

export async function getSharedUrlByUrl(url: string): Promise<SharedUrl[]> {
  return db
    .select()
    .from(schema.sharedUrls)
    .where(eq(schema.sharedUrls.url, url))
}

export async function insertSharedUrl(input: {
  url: string
  hashedUrl: string
  originalUrl: string
  userId: string
}): Promise<SharedUrl[]> {
  return db.insert(schema.sharedUrls).values(input).returning()
}
