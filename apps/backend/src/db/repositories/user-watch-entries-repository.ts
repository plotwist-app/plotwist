import { eq } from 'drizzle-orm'
import { db } from '..'
import { userWatchEntries } from '../schema'

export async function createWatchEntry(data: {
  userItemId: string
  watchedAt?: Date
}) {
  const [entry] = await db
    .insert(userWatchEntries)
    .values({
      userItemId: data.userItemId,
      watchedAt: data.watchedAt ?? new Date(),
    })
    .returning()

  return entry
}

export async function getWatchEntriesByUserItemId(userItemId: string) {
  return db
    .select()
    .from(userWatchEntries)
    .where(eq(userWatchEntries.userItemId, userItemId))
    .orderBy(userWatchEntries.watchedAt)
}

export async function updateWatchEntry(id: string, watchedAt: Date) {
  const [entry] = await db
    .update(userWatchEntries)
    .set({ watchedAt })
    .where(eq(userWatchEntries.id, id))
    .returning()

  return entry
}

export async function deleteWatchEntry(id: string) {
  const [entry] = await db
    .delete(userWatchEntries)
    .where(eq(userWatchEntries.id, id))
    .returning()

  return entry
}

export async function deleteWatchEntriesByUserItemId(userItemId: string) {
  await db
    .delete(userWatchEntries)
    .where(eq(userWatchEntries.userItemId, userItemId))
}
