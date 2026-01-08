import { selectUserPreferences } from '@/db/repositories/user-preferences'

export type GetUserPreferencesParams = {
  userId: string
}

export async function getUserPreferencesService({
  userId,
}: GetUserPreferencesParams) {
  const [userPreferences] = await selectUserPreferences(userId)

  return { userPreferences: userPreferences ?? null }
}
