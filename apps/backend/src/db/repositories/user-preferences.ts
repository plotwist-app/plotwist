import { eq } from 'drizzle-orm'
import { db } from '@/db'
import type { UpdateUserPreferencesParams } from '@/domain/entities/user-preferences'
import { withDbTracing } from '@/infra/telemetry/with-db-tracing'
import { userPreferences } from '../schema'

const updateUserPreferencesImpl = async (
  params: UpdateUserPreferencesParams
) => {
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

export const updateUserPreferences = withDbTracing(
  'update-user-preferences',
  updateUserPreferencesImpl
)

const selectUserPreferencesImpl = async (userId: string) => {
  return await db
    .select()
    .from(userPreferences)
    .where(eq(userPreferences.userId, userId))
}

export const selectUserPreferences = withDbTracing(
  'select-user-preferences',
  selectUserPreferencesImpl
)
