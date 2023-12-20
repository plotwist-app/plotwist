import { Poster } from '@/app/app/components/poster'
import { Badge } from '@/components/ui/badge'
import { tmdbImage } from '@/utils/tmdb/image'
import { StarFilledIcon } from '@radix-ui/react-icons'
import { format } from 'date-fns'
import { Season as TmdbSeason } from 'tmdb-ts'

type Season = TmdbSeason & {
  vote_average?: number
}

type TvShowDetailsSeasonsProps = {
  seasons: Season[]
}

type TvShowDetailsSeasonProps = { season: Season }

const TvShowDetailsSeason = ({ season }: TvShowDetailsSeasonProps) => {
  const {
    poster_path: poster,
    name,
    overview,
    episode_count: episodeCount,
    air_date: airDate,
    vote_average: vote,
  } = season

  return (
    <div className="group flex cursor-pointer space-x-4">
      <div className="w-1/5">
        <Poster url={tmdbImage(poster)} alt={name} />
      </div>

      <div className="w-4/5 space-y-2">
        <div className="space-y-1">
          <h6 className="underline-offset-1.5 text-lg font-bold group-hover:underline">
            {name}
          </h6>

          <div className="flex flex-wrap gap-1">
            <Badge>
              <StarFilledIcon width={12} height={12} className="mr-1" />
              {vote}
            </Badge>

            <Badge variant="outline">
              {format(new Date(airDate), 'MMM, yyyy')}
            </Badge>

            <Badge variant="outline">{episodeCount} episodes</Badge>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">{overview}</p>
      </div>
    </div>
  )
}

export const TvShowDetailsSeasons = ({
  seasons,
}: TvShowDetailsSeasonsProps) => {
  return (
    <div className="space-y-4">
      {seasons.map((season) => (
        <TvShowDetailsSeason season={season} key={season.id} />
      ))}
    </div>
  )
}
