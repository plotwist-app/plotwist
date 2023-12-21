import { TMDB } from '@/services/TMDB'
import { TvShowEpisodeCard } from './tv-show-season-episode-card'

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

  return (
    <div className="mt-2 grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 md:grid-cols-3">
      {episodes.map((episode) => (
        <TvShowEpisodeCard episode={episode} key={episode.id} />
      ))}
    </div>
  )
}
