import { fetchList } from '@/services/api/lists'
import { tmdb } from '@plotwist/tmdb'
import Cors from 'micro-cors'

Cors({
  allowMethods: ['GET'],
})

function shuffleArray(array: unknown[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  const { id } = params

  try {
    const { data } = await fetchList(id)

    if (data) {
      const randomListItem =
        data.list_items[Math.floor(Math.random() * data.list_items.length)]

      const movieRelated = await tmdb.movies.related(
        randomListItem.tmdb_id,
        'recommendations',
        'en-US',
      )

      shuffleArray(movieRelated.results)

      const uniqueRecommendedMovies = movieRelated.results.filter(
        (recommendedMovie) =>
          !data.list_items.some(
            (listItem) => listItem.tmdb_id === recommendedMovie.id,
          ),
      )

      const topUniqueRecommendedMovies = uniqueRecommendedMovies.slice(0, 3)

      const newRecommendations = topUniqueRecommendedMovies

      return new Response(JSON.stringify({ movie: newRecommendations }), {
        status: 200,
      })
    }
  } catch {
    // É uma boa prática retornar alguma resposta no catch para lidar com erros.
    return new Response(JSON.stringify({ error: 'An error occurred' }), {
      status: 500,
    })
  }
}
