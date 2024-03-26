/* eslint-disable camelcase */
import { CombinedCredit, RawMovieCredit, RawTvSerieCredit } from '..'

export const formatCombinedCredit = (
  credit: RawMovieCredit | RawTvSerieCredit,
): CombinedCredit => {
  if ((credit as RawTvSerieCredit).name) {
    const {
      first_air_date: date,
      id,
      name,
      character,
      vote_average,
      vote_count,
      backdrop_path,
    } = credit as RawTvSerieCredit

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
