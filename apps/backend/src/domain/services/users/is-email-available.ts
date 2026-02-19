import { getUserByEmail } from '@/db/repositories/user-repository'
import { EmailAlreadyRegisteredError } from '../../errors/email-already-registered'

type IsEmailAvailableInterface = {
  email: string
}

export async function isEmailAvailable({ email }: IsEmailAvailableInterface) {
  const [user] = await getUserByEmail(email)

  if (user) {
    return new EmailAlreadyRegisteredError()
  }

  return { available: true }
}
