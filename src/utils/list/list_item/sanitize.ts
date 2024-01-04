import { ListItem } from '@/types/lists'
import { MovieDetails, TvShowDetails } from 'tmdb-ts'

export const sanitizeListItem = (
  listId: number,
  raw: MovieDetails | TvShowDetails,
): Omit<ListItem, 'created_at' | 'id'> => {
  // tv shows has ".name" and movie has `.title`
  const isTvShow = 'name' in raw

  const title = isTvShow
    ? (raw as TvShowDetails).name
    : (raw as MovieDetails).title

  return {
    list_id: listId,

    backdrop_path: raw.backdrop_path,
    overview: raw.overview,
    poster_path: raw.poster_path,
    title,
    tmdb_id: raw.id,
    media_type: isTvShow ? 'tv_show' : 'movie',

    status: 'PENDING',
  }
}
