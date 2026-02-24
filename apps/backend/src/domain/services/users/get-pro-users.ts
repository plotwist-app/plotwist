import { getProUsersDetails } from '@/infra/db/repositories/user-repository'

export async function getProUsersDetailsService() {
  const users = await getProUsersDetails()

  return { users }
}
