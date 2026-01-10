import { updateUserPreferences } from '@/db/repositories/user-preferences'
import type { UpdateUserPreferencesParams } from '@/domain/entities/user-preferences'

export async function updateUserPreferencesService(
  params: UpdateUserPreferencesParams
) {
  const [userPreferences] = await updateUserPreferences(params)

  return { userPreferences }
}
