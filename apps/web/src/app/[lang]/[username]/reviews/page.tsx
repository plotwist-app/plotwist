import { getUsersUsername } from '@/api/users'
import { Reviews } from './_reviews'

export default async function ReviewsPage({
  params,
}: {
  params: { username: string }
}) {
  const { user } = await getUsersUsername(params.username)

  return <Reviews userId={user.id} />
}
