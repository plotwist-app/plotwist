import { MovieDetails } from '@/services/tmdb/requests/movies/details'
import { TvSeriesDetails } from '@/services/tmdb/requests/tv-series/details'
import {
  Movie,
  MovieWithMediaType,
  TvSerieWithMediaType,
} from '@/services/tmdb/types'
import { ListItem } from '@/types/supabase/lists'

type Raw =
  | MovieDetails
  | TvSeriesDetails
  | Movie
  | MovieWithMediaType
  | TvSerieWithMediaType

export const sanitizeListItem = (
  listId: string,
  raw: Raw,
): Omit<ListItem, 'created_at' | 'id'> => {
  const isTvSerie = 'name' in raw

  const title = isTvSerie
    ? (raw as TvSeriesDetails).name
    : (raw as MovieDetails).title

  return {
    list_id: listId,
    backdrop_path: raw.backdrop_path ?? '',
    overview: raw.overview,
    poster_path: raw.poster_path,
    title,
    tmdb_id: raw.id,
    media_type: isTvSerie ? 'TV_SHOW' : 'MOVIE',
    status: 'PENDING',
    rating: null,
  }
}
