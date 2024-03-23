import { axiosClient } from '..'
import { Language } from '../models/language'
import { Movie, MovieDetails } from '../models/movie'
import { ListResponse } from '../utils/list-response'

/*
|-----------------------------------------------------------------------------
| Details
| 
| References:
| https://developer.themoviedb.org/reference/movie-details
| 
|-----------------------------------------------------------------------------
*/

const details = async (id: number, language: Language) => {
  const { data } = await axiosClient.get<MovieDetails>(`/movie/${id}`, {
    params: {
      language,
    },
  })

  return data
}

/*
|-----------------------------------------------------------------------------
| Discover movie
| 
| References:
| https://developer.themoviedb.org/reference/discover-movie
| 
|-----------------------------------------------------------------------------
*/

type DiscoverMovieFilters = Partial<
  Record<
    | 'with_genres'
    | 'release_date.gte'
    | 'release_date.lte'
    | 'with_original_language'
    | 'sort_by'
    | 'with_watch_providers'
    | 'with_keywords'
    | 'watch_region'
    | 'vote_average.gte'
    | 'vote_average.lte'
    | 'vote_count.gte',
    string | null
  >
>

type DiscoverOptions = {
  language: Language
  page: number
  filters: DiscoverMovieFilters
}

const discover = async (options: DiscoverOptions) => {
  const { page, language, filters } = options

  const { data } = await axiosClient.get<ListResponse<Movie>>(
    `/discover/movie`,
    {
      params: {
        page,
        language,
        ...filters,
      },
    },
  )

  return data
}

/*
|-----------------------------------------------------------------------------
| Movie lists
| 
| References:
| 1. https://developer.themoviedb.org/reference/movie-now-playing-list
| 2. https://developer.themoviedb.org/reference/movie-popular-list
| 3. https://developer.themoviedb.org/reference/movie-top-rated-list
| 4. https://developer.themoviedb.org/reference/movie-upcoming-list
| 
|-----------------------------------------------------------------------------
*/

type ListOptions = {
  list: 'popular' | 'now_playing' | 'top_rated' | 'upcoming'
  language: Language
  page: number
}

const list = async (options: ListOptions) => {
  const { list, page = 1, language } = options

  const { data } = await axiosClient.get<ListResponse<Movie>>(
    `/movie/${list}`,
    {
      params: {
        language,
        page,
      },
    },
  )

  return data
}

/*
|-----------------------------------------------------------------------------
| Movie related (similar & recommendations)
| 
| References:
| 1. https://developer.themoviedb.org/reference/movie-recommendations
| 2. https://developer.themoviedb.org/reference/movie-similar
| 
|-----------------------------------------------------------------------------
*/

type RelatedType = 'recommendations' | 'similar'
type RelatedResponse = ListResponse<Movie>

const related = async (id: number, type: RelatedType, language: Language) => {
  const { data } = await axiosClient.get<RelatedResponse>(
    `/movie/${id}/${type}`,

    {
      params: {
        language,
      },
    },
  )

  return data
}

export const movies = { details, discover, related, list }
