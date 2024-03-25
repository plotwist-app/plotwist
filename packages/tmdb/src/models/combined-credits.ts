import { MovieWithMediaType, TvSerieWithMediaType } from '.'
import { MediaType } from '../utils/with_media_type'

export type RawMovieCredit = MovieWithMediaType & {
  character: string
}

export type RawTvSerieCredit = TvSerieWithMediaType & {
  character: string
}

export type RawCredit = RawMovieCredit | RawTvSerieCredit

export type CombinedCreditsResponse = {
  cast: Array<RawCredit>
  crew: Array<RawCredit>
}

export type CombinedCredit = {
  id: number
  title: string
  date: string
  media_type: MediaType
  role: string
  vote_average: number
  vote_count: number
  backdrop_path?: string
}

export type CombinedCredits = {
  cast: Array<CombinedCredit>
  crew: Array<CombinedCredit>
}
