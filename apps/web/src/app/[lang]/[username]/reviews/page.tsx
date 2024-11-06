import { getUsersUsername } from '@/api/users'
import { ProfileReviews } from '../_components/profile-reviews'

export default async function ReviewsPage({
  params,
}: {
  params: { username: string }
}) {
  const { user } = await getUsersUsername(params.username)

  return <ProfileReviews userId={user.id} />
}
