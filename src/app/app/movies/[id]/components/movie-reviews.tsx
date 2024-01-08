import { Reviews } from '@/app/app/components/reviews'

type MovieReviewsProps = { movieId: number }

export const MovieReviews = ({ movieId }: MovieReviewsProps) => {
  return <Reviews tmdbId={movieId} mediaType="MOVIE" />
}
