/* eslint-disable camelcase */
import { tmdbClient } from '@/services/tmdb'
import { Language } from '@/types/languages'
import {
  CombinedCredits,
  CombinedCreditsResponse,
  Credit,
  RawCredit,
  RawMovieCredit,
  RawMovieTvShowCredit,
} from './combined-credits.types'

const formatCredit = (credit: RawCredit): Credit => {
  if ((credit as RawMovieTvShowCredit).name) {
    const {
      first_air_date: date,
      id,
      name,
      character,
      vote_average,
      vote_count,
      backdrop_path,
    } = credit as RawMovieTvShowCredit

    return {
      date,
      id,
      title: name,
      media_type: 'tv',
      role: character,
      vote_average,
      vote_count,
      backdrop_path,
    }
  }

  const {
    title,
    id,
    character,
    release_date: date,
    vote_average,
    vote_count,
    backdrop_path,
  } = credit as RawMovieCredit

  return {
    title,
    id,
    date,

    media_type: 'movie',
    role: character,
    vote_count,
    vote_average,
    backdrop_path,
  }
}

export const combinedCredits = async (personId: number, language: Language) => {
  const { data } = await tmdbClient.get<CombinedCreditsResponse>(
    `/person/${personId}/combined_credits`,
    {
      params: {
        language,
      },
    },
  )

  const formattedResponse: CombinedCredits = {
    cast: data.cast.map((credit) => formatCredit(credit)),
    crew: data.cast.map((credit) => formatCredit(credit)),
  }

  return formattedResponse
}
