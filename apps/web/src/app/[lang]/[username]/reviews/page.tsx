import { getUsersUsername } from '@/api/users'
import { Reviews } from './_reviews'

export default async function ReviewsPage(props: {
  params: Promise<{ username: string }>
}) {
  const params = await props.params
  const { user } = await getUsersUsername(params.username)

  return <Reviews userId={user.id} />
}
