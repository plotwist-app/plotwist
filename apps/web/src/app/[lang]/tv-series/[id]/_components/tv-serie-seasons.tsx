import type { Season } from '@/services/tmdb'

import { Poster } from '@/components/poster'
import type { Language } from '@/types/languages'

import { Link } from 'next-view-transitions'

type TvSerieSeasonsProps = {
  seasons: Season[]
  id: number
  language: Language
}

export const TvSerieSeasons = ({
  seasons,
  language,
  id,
}: TvSerieSeasonsProps) => {
  const filteredSeasons = seasons.filter(
    season =>
      season.season_number !== 0 &&
      season.episode_count > 0 &&
      season.air_date !== null
  )

  return (
    <div className="grid grid-cols-3 gap-4 md:grid-cols-5 items-start">
      {filteredSeasons.map(
        ({ poster_path: poster, name, season_number: seasonNumber }) => (
          <Link
            href={`/${language}/tv-series/${id}/seasons/${seasonNumber}`}
            key={seasonNumber}
          >
            <Poster url={poster} alt={name} />
          </Link>
        )
      )}
    </div>
  )
}
