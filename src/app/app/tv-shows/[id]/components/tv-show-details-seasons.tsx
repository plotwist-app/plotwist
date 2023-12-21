import { Poster } from '@/app/app/components/poster'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { tmdbImage } from '@/utils/tmdb/image'
import { StarFilledIcon } from '@radix-ui/react-icons'
import { format } from 'date-fns'
import { Season as TmdbSeason } from 'tmdb-ts'
import { TvShowSeasonDetails } from './tv-show-season-details'

type Season = TmdbSeason & {
  vote_average?: number
}

type TvShowDetailsSeasonsProps = {
  seasons: Season[]
  tvShowID: number
}

type TvShowDetailsSeasonProps = { season: Season; tvShowID: number }

const TvShowDetailsSeason = ({
  season,
  tvShowID,
}: TvShowDetailsSeasonProps) => {
  const {
    poster_path: poster,
    name,
    overview,
    episode_count: episodeCount,
    air_date: airDate,
    vote_average: voteAverage,
    season_number: seasonNumber,
  } = season

  return (
    <Dialog>
      <DialogTrigger asChild>
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
                <Badge>{voteAverage?.toFixed(1)}</Badge>

                <Badge variant="outline">
                  {format(new Date(airDate), 'MMM, yyyy')}
                </Badge>

                <Badge variant="outline">{episodeCount} episodes</Badge>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">{overview}</p>
          </div>
        </div>
      </DialogTrigger>

      <DialogContent className="max-h-[75vh] overflow-y-auto sm:max-w-[978px]">
        <DialogHeader className="text-start">
          <DialogTitle>{name}</DialogTitle>
          <DialogDescription>{overview}</DialogDescription>
        </DialogHeader>

        <TvShowSeasonDetails seasonNumber={seasonNumber} tvShowID={tvShowID} />
      </DialogContent>
    </Dialog>
  )
}

export const TvShowDetailsSeasons = ({
  seasons,
  tvShowID,
}: TvShowDetailsSeasonsProps) => {
  return (
    <div className="space-y-4">
      {seasons.map((season) => (
        <TvShowDetailsSeason
          season={season}
          key={season.id}
          tvShowID={tvShowID}
        />
      ))}
    </div>
  )
}
