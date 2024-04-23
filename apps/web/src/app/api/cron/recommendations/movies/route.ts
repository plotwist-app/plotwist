import { getProfilesBySubscriptionType } from '@/services/api/profiles/get-profiles-by-subscription-type'
import { getUserLastReviewService } from '@/services/api/reviews'
import { Profile } from '@/types/supabase'
import { Review } from '@/types/supabase/reviews'
import { Language, tmdb } from '@plotwist/tmdb'
import Cors from 'micro-cors'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { MoviesRecommendations } from '@plotwist/email'

Cors({
  allowMethods: ['POST', 'HEAD'],
})
const resend = new Resend(process.env.RESEND_KEY)

async function getRecommendations(review: Review, language: Language) {
  const { results } = await tmdb.movies.related(
    review.tmdb_id,
    'recommendations',
    language,
  )

  return results.slice(0, 3)
}

async function processUser(user: Profile): Promise<void> {
  const lastMovieReview = await getUserLastReviewService({
    userId: user.id,
    mediaType: 'MOVIE',
  })

  if (lastMovieReview) {
    const recommendations = await getRecommendations(
      lastMovieReview,
      lastMovieReview.language,
    )

    const lastMovieReviewTitle = lastMovieReview.tmdb_title

    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to:
        process.env.NODE_ENV === 'development'
          ? 'status451jr@gmail.com'
          : user.email,
      subject: `Personalized movies picks just for you - See what's next after "Fight Club"`,
      react: MoviesRecommendations({
        movies: recommendations,
        movieTitle: lastMovieReviewTitle,
        username: user.username,
        language: lastMovieReview.language,
      }),
    })
  }
}

export async function POST(): Promise<NextResponse> {
  try {
    const proUsers = await getProfilesBySubscriptionType('PRO')

    if (proUsers.length > 0) {
      await Promise.all(proUsers.map(processUser))
    }

    return NextResponse.json({ result: null, ok: true })
  } catch (error) {
    return NextResponse.json({ error, ok: false })
  }
}
