import { getProfilesBySubscriptionType } from '@/services/api/profiles/get-profiles-by-subscription-type'
import { getUserLastReviewService } from '@/services/api/reviews'
import { Profile } from '@/types/supabase'
import { Review } from '@/types/supabase/reviews'
import { Language, tmdb } from '@plotwist/tmdb'
import Cors from 'micro-cors'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'

Cors({
  allowMethods: ['POST', 'HEAD'],
})
const resend = new Resend(process.env.RESEND_KEY)

function generateRecommendationsEmail(
  recommendations: { id: number; title: string }[],
  language: Language,
) {
  const title: Record<Language, string> = {
    'de-DE':
      'Sie werden es wahrscheinlich interessant finden, die folgenden Titel anzusehen:',
    'en-US':
      'You will probably find it interesting to watch the following titles:',
    'es-ES': 'Probablemente te resulte interesante ver los siguientes títulos:',
    'fr-FR':
      'Vous trouverez probablement intéressant de regarder les titres suivants:',
    'it-IT': 'Probabilmente troverai interessante guardare i seguenti titoli:',
    'ja-JP': 'おそらく次のタイトルを見てみると面白いでしょう。',
    'pt-BR':
      'Você provavelmente achará interessante assistir aos seguintes títulos:',
  }

  return (
    `
    <h3>${title[language]}</h3>
    <ul>` +
    recommendations
      .map(
        (result) =>
          `<li><a href="https://plotwist.app/${language}/movies/${result.id}">${result.title}</a></li>`,
      )
      .join('') +
    `</ul>`
  )
}

async function getRecommendations(review: Review, language: Language) {
  const { results } = await tmdb.movies.related(
    review.tmdb_id,
    'recommendations',
    language,
  )

  return results.slice(0, 5).map(({ id, title }) => ({ id, title }))
}

export async function sendRecommendationEmail(
  html: string,
  movieTitle: string,
  receiver: string,
) {
  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to:
      process.env.NODE_ENV === 'development'
        ? 'status451jr@gmail.com'
        : receiver,
    subject: `Because you reviewed - ${movieTitle}`,
    html,
  })
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

    const html = generateRecommendationsEmail(
      recommendations,
      lastMovieReview.language,
    )

    await sendRecommendationEmail(html, lastMovieReview.tmdb_title, user.email)
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
