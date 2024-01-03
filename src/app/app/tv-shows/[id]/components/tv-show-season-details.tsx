import { TMDB } from '@/services/TMDB'
import { TvShowSeasonDetailsContent } from './tv-show-season-details-content'

type TvShowSeasonDetailsProps = {
  tvShowID: number
  seasonNumber: number
}

export const TvShowSeasonDetails = async ({
  tvShowID,
  seasonNumber,
}: TvShowSeasonDetailsProps) => {
  const { episodes } = await TMDB.tvSeasons.details({
    tvShowID,
    seasonNumber,
  })

  return <TvShowSeasonDetailsContent episodes={episodes} />
}
