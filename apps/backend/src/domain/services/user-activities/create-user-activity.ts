import { insertUserActivity } from '@/db/repositories/user-activities'
import { withServiceTracing } from '@/infra/telemetry/with-service-tracing'
import type { InsertUserActivity } from '@/domain/entities/user-activity'

const createUserActivityImpl = async (params: InsertUserActivity) => {
  return await insertUserActivity(params)
}

export const createUserActivity = withServiceTracing(
  'create-user-activity',
  createUserActivityImpl
)
