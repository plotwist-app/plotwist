import { tmdb } from '@plotwist/tmdb'
import { homeMovies } from '@/app/[lang]/page'
import { Language } from '@/types/languages'

const PAGES_BY_TYPE = 30

export const getMoviesIds = async (language: Language) => {
  const types = ['now_playing', 'popular', 'top_rated', 'upcoming'] as const

  console.time()
  const lists = await Promise.all(
    Array.from({ length: PAGES_BY_TYPE }).map(
      async (_, index) =>
        await Promise.all(
          types.map(
            async (type) =>
              await tmdb.movies.list({
                language,
                list: type,
                page: index + 1,
              }),
          ),
        ),
    ),
  )
  console.timeEnd()

  console.time()
  const results = lists.flatMap((list) => list.map((list) => list.results))
  const ids = results.flatMap((result) => result.map((movie) => movie.id))

  const combinedIds = [...Object.values(homeMovies), ...ids]
  const uniqueIds = Array.from(new Set(combinedIds))
  console.timeEnd()

  console.log({ length: uniqueIds.length })

  return uniqueIds
}
