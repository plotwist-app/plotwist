import {
  MovieDetails,
  TvSerieDetails,
  Movie,
  MovieWithMediaType,
  TvSerieWithMediaType,
  TvSerie,
} from '@plotwist/tmdb'

import { PostListItem201ListItem } from '@/api/endpoints.schemas'

type Raw =
  | MovieDetails
  | Movie
  | MovieWithMediaType
  | TvSerieDetails
  | TvSerieWithMediaType
  | TvSerie

export const sanitizeListItem = (
  listId: string,
  raw: Raw,
): Omit<PostListItem201ListItem, 'createdAt' | 'id' | 'position'> => {
  const isTvSerie = 'name' in raw

  const title = isTvSerie
    ? (raw as TvSerieDetails).name
    : (raw as MovieDetails).title

  return {
    listId,
    backdropPath: raw.backdrop_path ?? '',
    overview: raw.overview,
    posterPath: raw.poster_path!,
    title,
    tmdbId: raw.id,
    mediaType: isTvSerie ? 'TV_SHOW' : 'MOVIE',
  }
}
