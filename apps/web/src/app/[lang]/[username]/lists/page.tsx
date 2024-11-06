import { getUsersUsername } from '@/api/users'
import { ProfileLists } from '../_components/profile-lists'

export default async function ListsPage({
  params,
}: {
  params: { username: string }
}) {
  const { user } = await getUsersUsername(params.username)

  return <ProfileLists userId={user.id} />
}
