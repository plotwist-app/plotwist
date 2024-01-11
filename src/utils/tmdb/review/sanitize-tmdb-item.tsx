import { Review } from '@/types/supabase/reviews'
import { MovieDetails, TvShowDetails } from 'tmdb-ts'

export const sanitizeTmdbItem = (
  tmdbItem: MovieDetails | TvShowDetails,
): Pick<
  Review,
  'tmdb_id' | 'tmdb_overview' | 'tmdb_poster_path' | 'tmdb_title'
> => {
  const isTvShow = 'name' in tmdbItem

  const title = isTvShow
    ? (tmdbItem as TvShowDetails).name
    : (tmdbItem as MovieDetails).title

  return {
    tmdb_id: tmdbItem.id,
    tmdb_overview: tmdbItem.overview,
    tmdb_poster_path: tmdbItem.poster_path,
    tmdb_title: title,
  }
}
