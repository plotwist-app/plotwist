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

  const movies = items.filter((item) => item.media_type === 'MOVIE')
  if (movies.length === 0) {
    const topRatedMovies = await tmdb.movies.list({
      list: 'top_rated',
      language,
      page: 1,
    })

    return getRandomItems(topRatedMovies.results, 3)
  }

  const randomMovie = movies[Math.floor(Math.random() * movies.length)]
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

const generateTVRecommendations = async (list: List, language: Language) => {
  const { list_items: items } = list

  const tvSeries = items.filter((item) => item.media_type === 'TV_SHOW')

  if (tvSeries.length === 0) {
    const topRatedTvSeries = await tmdb.tv.list({
      list: 'top_rated',
      language,
      page: 1,
    })

    return getRandomItems(topRatedTvSeries.results, 3)
  }

  const randomTvSeries = tvSeries[Math.floor(Math.random() * tvSeries.length)]
  const recommendations = await tmdb.tv.related(
    randomTvSeries.tmdb_id,
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
    const data = await fetchList(id)

    if (!data) {
      return new Response(JSON.stringify({ error: 'List not found' }), {
        status: 404,
      })
    }

    const [movies, tv] = await Promise.all([
      generateMovieRecommendations(data, language),
      generateTVRecommendations(data, language),
    ])

    return new Response(JSON.stringify({ movies, tv }), {
      status: 200,
    })
  } catch {
    return new Response(JSON.stringify({ error: 'An error occurred' }), {
      status: 500,
    })
  }
}
