import { MovieDetails, TvSerieDetails } from '@plotwist/tmdb'
import { Review } from '@/types/supabase/reviews'

export const sanitizeTmdbItem = (
  tmdbItem: MovieDetails | TvSerieDetails,
): Pick<
  Review,
  'tmdb_id' | 'tmdb_overview' | 'tmdb_poster_path' | 'tmdb_title'
> => {
  const isTvSerie = 'name' in tmdbItem

  const title = isTvSerie
    ? (tmdbItem as TvSerieDetails).name
    : (tmdbItem as MovieDetails).title

  return {
    tmdb_id: tmdbItem.id,
    tmdb_overview: tmdbItem.overview,
    tmdb_poster_path: tmdbItem.poster_path,
    tmdb_title: title,
  }
}
