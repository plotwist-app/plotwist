import { eq } from 'drizzle-orm'
import { withDbTracing } from '@/infra/telemetry/with-db-tracing'
import { db } from '..'
import { userWatchEntries } from '../schema'

const createWatchEntryImpl = async (data: {
  userItemId: string
  watchedAt?: Date
}) => {
  const [entry] = await db
    .insert(userWatchEntries)
    .values({
      userItemId: data.userItemId,
      watchedAt: data.watchedAt ?? new Date(),
    })
    .returning()

  return entry
}

export const createWatchEntry = withDbTracing(
  'create-watch-entry',
  createWatchEntryImpl
)

const getWatchEntriesByUserItemIdImpl = async (userItemId: string) => {
  return db
    .select()
    .from(userWatchEntries)
    .where(eq(userWatchEntries.userItemId, userItemId))
    .orderBy(userWatchEntries.watchedAt)
}

export const getWatchEntriesByUserItemId = withDbTracing(
  'get-watch-entries-by-user-item-id',
  getWatchEntriesByUserItemIdImpl
)

const updateWatchEntryImpl = async (id: string, watchedAt: Date) => {
  const [entry] = await db
    .update(userWatchEntries)
    .set({ watchedAt })
    .where(eq(userWatchEntries.id, id))
    .returning()

  return entry
}

export const updateWatchEntry = withDbTracing(
  'update-watch-entry',
  updateWatchEntryImpl
)

const deleteWatchEntryImpl = async (id: string) => {
  const [entry] = await db
    .delete(userWatchEntries)
    .where(eq(userWatchEntries.id, id))
    .returning()

  return entry
}

export const deleteWatchEntry = withDbTracing(
  'delete-watch-entry',
  deleteWatchEntryImpl
)

const deleteWatchEntriesByUserItemIdImpl = async (userItemId: string) => {
  await db
    .delete(userWatchEntries)
    .where(eq(userWatchEntries.userItemId, userItemId))
}

export const deleteWatchEntriesByUserItemId = withDbTracing(
  'delete-watch-entries-by-user-item-id',
  deleteWatchEntriesByUserItemIdImpl
)
