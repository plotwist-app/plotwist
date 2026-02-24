import type { UpdateUserPreferencesParams } from '@/domain/entities/user-preferences'
import { updateUserPreferences } from '@/infra/db/repositories/user-preferences'

export async function updateUserPreferencesService(
  params: UpdateUserPreferencesParams
) {
  const [userPreferences] = await updateUserPreferences(params)

  return { userPreferences }
}
