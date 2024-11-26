import { getUsersUsername } from '@/api/users'
import { ProfileLists } from '../_components/profile-lists'

export default async function ListsPage(
  props: {
    params: Promise<{ username: string }>
  }
) {
  const params = await props.params;
  const { user } = await getUsersUsername(params.username)

  return <ProfileLists userId={user.id} />
}
