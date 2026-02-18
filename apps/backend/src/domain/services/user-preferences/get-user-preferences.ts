import { selectUserPreferences } from '@/db/repositories/user-preferences'
import { withServiceTracing } from '@/infra/telemetry/with-service-tracing'

export type GetUserPreferencesParams = {
  userId: string
}

const getUserPreferencesServiceImpl = async ({
  userId,
}: GetUserPreferencesParams) => {
  const [userPreferences] = await selectUserPreferences(userId)

  return { userPreferences: userPreferences ?? null }
}

export const getUserPreferencesService = withServiceTracing(
  'get-user-preferences',
  getUserPreferencesServiceImpl
)
