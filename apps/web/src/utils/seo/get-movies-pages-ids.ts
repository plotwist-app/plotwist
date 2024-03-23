import { tmdb } from '@plotwist/tmdb'

import { homeMovies } from '@/app/[lang]/page'
import { Language } from '@/types/languages'

export const getMoviesPagesIds = async (language: Language) => {
  const movieListTypes = [
    'now_playing',
    'popular',
    'top_rated',
    'upcoming',
  ] as const

  const movieLists = await Promise.all(
    movieListTypes.map((listType) =>
      tmdb.movies.list({ language, list: listType, page: 1 }),
    ),
  )

  const moviesIds = movieLists.flatMap((movieList) =>
    movieList.results.map((movie) => String(movie.id)),
  )

  const combinedIds = [...Object.values(homeMovies), ...moviesIds]
  const uniqueIds = Array.from(new Set(combinedIds))

  return uniqueIds
}
