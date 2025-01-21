import type { Season } from '@/services/tmdb'

import { Poster } from '@/components/poster'
import type { Language } from '@/types/languages'

import Link from 'next/link'

type TvSerieSeasonsProps = {
  seasons: Season[]
  id: number
  language: Language
}

type TvSerieSeasonProps = { season: Season; id: number; language: Language }
const TvSerieSeason = ({ season, id }: TvSerieSeasonProps) => {
  const { poster_path: poster, name, season_number: seasonNumber } = season

  return (
    <Link href={`/tv-series/${id}/seasons/${seasonNumber}`}>
      <Poster url={poster} alt={name} />
    </Link>
  )
}

export const TvSerieSeasons = ({
  seasons,
  id,
  language,
}: TvSerieSeasonsProps) => {
  const filteredSeasons = seasons.filter(
    season =>
      season.season_number !== 0 &&
      season.episode_count > 0 &&
      season.air_date !== null
  )

  return (
    <div className="grid grid-cols-3 gap-4 md:grid-cols-5 items-start">
      {filteredSeasons.map(season => (
        <TvSerieSeason
          season={season}
          key={season.id}
          id={id}
          language={language}
        />
      ))}
    </div>
  )
}
