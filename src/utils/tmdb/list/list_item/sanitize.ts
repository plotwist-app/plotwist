import { MovieDetails } from '@/services/tmdb2/requests/movies/details'
import { TvSeriesDetails } from '@/services/tmdb2/requests/tv-series/details'
import { Movie } from '@/services/tmdb2/types'
import { ListItem } from '@/types/supabase/lists'

type Raw = MovieDetails | TvSeriesDetails | Movie

export const sanitizeListItem = (
  listId: number,
  raw: Raw,
): Omit<ListItem, 'created_at' | 'id'> => {
  const isTvShow = 'name' in raw

  const title = isTvShow
    ? (raw as TvSeriesDetails).name
    : (raw as MovieDetails).title

  return {
    list_id: listId,
    backdrop_path: raw.backdrop_path ?? '',
    overview: raw.overview,
    poster_path: raw.poster_path,
    title,
    tmdb_id: raw.id,
    media_type: isTvShow ? 'TV_SHOW' : 'MOVIE',
    status: 'PENDING',
  }
}
