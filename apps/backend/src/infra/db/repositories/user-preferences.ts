import { eq } from 'drizzle-orm'
import type { UpdateUserPreferencesParams } from '@/domain/entities/user-preferences'
import { db } from '@/infra/db'
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
        ...(params.watchProvidersIds !== undefined && {
          watchProvidersIds: params.watchProvidersIds,
        }),
        ...(params.watchRegion !== undefined && {
          watchRegion: params.watchRegion,
        }),
        ...(params.mediaTypes !== undefined && {
          mediaTypes: params.mediaTypes,
        }),
        ...(params.genreIds !== undefined && { genreIds: params.genreIds }),
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
