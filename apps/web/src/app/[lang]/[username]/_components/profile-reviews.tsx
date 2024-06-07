import { FullReview, FullReviewSkeleton } from '@/components/full-review'
import { EmptyReview } from '../../_components/user-last-review'
import { useQuery } from '@tanstack/react-query'
import { getProfileReviews } from '@/services/api/profiles'
import { Profile } from '@/types/supabase'
import { useLanguage } from '@/context/language'

type ProfileReviewsProps = {
  profile: Profile
}

export const ProfileReviews = ({ profile }: ProfileReviewsProps) => {
  const { language } = useLanguage()
  const { data: reviews, isLoading } = useQuery({
    queryFn: async () =>
      await getProfileReviews({ language, userId: profile.id }),
    queryKey: ['reviews'],
  })

  if (!reviews || isLoading) {
    return <FullReviewSkeleton />
  }

  return (
    <div className="space-y-4">
      {reviews.length > 0 ? (
        reviews.map((review) => (
          <FullReview language={language} review={review} key={review.id} />
        ))
      ) : (
        <EmptyReview />
      )}
    </div>
  )
}
