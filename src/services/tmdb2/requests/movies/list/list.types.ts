import { ListResponse, Movie } from '@/services/tmdb2/types'

export type MovieListType = 'popular' | 'now_playing' | 'top_rated' | 'upcoming'
export type MovieListResponse = ListResponse<Movie>