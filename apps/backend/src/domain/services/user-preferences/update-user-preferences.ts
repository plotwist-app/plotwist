import { updateUserPreferences } from '@/db/repositories/user-preferences'
import { withServiceTracing } from '@/infra/telemetry/with-service-tracing'
import type { UpdateUserPreferencesParams } from '@/domain/entities/user-preferences'

const updateUserPreferencesServiceImpl = async (
  params: UpdateUserPreferencesParams
) => {
  const [userPreferences] = await updateUserPreferences(params)

  return { userPreferences }
}

export const updateUserPreferencesService = withServiceTracing(
  'update-user-preferences',
  updateUserPreferencesServiceImpl
)
