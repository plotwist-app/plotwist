import { fetchList } from '@/services/api/lists'
import { Language } from '@/types/languages'
import { List } from '@/types/supabase/lists'
import { getRandomItems } from '@/utils/array'
import { tmdb } from '@plotwist/tmdb'
import Cors from 'micro-cors'

Cors({
  allowMethods: ['GET'],
})

const generateMovieRecommendations = async (list: List, language: Language) => {
  const { list_items: items } = list

  const randomMovie = items[Math.floor(Math.random() * items.length)]
  const recommendations = await tmdb.movies.related(
    randomMovie.tmdb_id,
    'recommendations',
    language,
  )

  const filteredRecommendations = recommendations.results.filter(
    (recommendation) => {
      const ids = items.map((item) => item.tmdb_id)

      return !ids.includes(recommendation.id)
    },
  )

  if (filteredRecommendations.length < 3) {
    return filteredRecommendations
  }

  return getRandomItems(filteredRecommendations, 3)
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  const { id } = params

  const url = new URL(request.url)
  const language = url.searchParams.get('language') as Language

  try {
    const { data } = await fetchList(id)

    if (!data || data.list_items.length === 0) {
      const topRatedMovies = await tmdb.movies.list({
        list: 'top_rated',
        language,
        page: 1,
      })

      return new Response(
        JSON.stringify({ movies: getRandomItems(topRatedMovies.results, 3) }),
        {
          status: 200,
        },
      )
    }

    const [movies] = await Promise.all([
      generateMovieRecommendations(data, language),
    ])

    return new Response(JSON.stringify({ movies }), {
      status: 200,
    })
  } catch {
    return new Response(JSON.stringify({ error: 'An error occurred' }), {
      status: 500,
    })
  }
}
