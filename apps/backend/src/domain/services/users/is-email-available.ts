import { getUserByEmail } from '@/db/repositories/user-repository'
import { withServiceTracing } from '@/infra/telemetry/with-service-tracing'
import { EmailAlreadyRegisteredError } from '../../errors/email-already-registered'

type IsEmailAvailableInterface = {
  email: string
}

const isEmailAvailableImpl = async ({
  email,
}: IsEmailAvailableInterface) => {
  const [user] = await getUserByEmail(email)

  if (user) {
    return new EmailAlreadyRegisteredError()
  }

  return { available: true }
}

export const isEmailAvailable = withServiceTracing(
  'is-email-available',
  isEmailAvailableImpl
)
