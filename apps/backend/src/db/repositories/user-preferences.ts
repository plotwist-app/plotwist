import { eq } from 'drizzle-orm'
import { db } from '@/db'
import type { UpdateUserPreferencesParams } from '@/domain/entities/user-preferences'
import { userPreferences } from '../schema'

export async function updateUserPreferences(
  params: UpdateUserPreferencesParams
) {
  return await db
    .insert(userPreferences)
    .values(params)
    .onConflictDoUpdate({
      target: [userPreferences.userId],
      set: {
        watchProvidersIds: params.watchProvidersIds,
        watchRegion: params.watchRegion,
      },
    })
    .returning()
}

export async function selectUserPreferences(userId: string) {
  return await db
    .select()
    .from(userPreferences)
    .where(eq(userPreferences.userId, userId))
}
