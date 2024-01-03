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
import { format } from 'date-fns'
import { Season as TmdbSeason } from 'tmdb-ts'
import { TvShowSeasonDetails } from './tv-show-season-details'

type Season = TmdbSeason & {
  vote_average?: number
}

type TvShowSeasonsProps = {
  seasons: Season[]
  tvShowID: number
}

type TvShowSeasonProps = { season: Season; tvShowID: number }

const TvShowSeason = ({ season, tvShowID }: TvShowSeasonProps) => {
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
        <div className="group flex cursor-pointer space-x-4 rounded-md  bg-muted/75 p-4 ">
          <div className="w-2/5">
            <Poster url={tmdbImage(poster)} alt={name} />
          </div>

          <div className="w-3/5 space-y-2">
            <div className="space-y-1">
              <h6 className="underline-offset-1.5 text-lg font-bold group-hover:underline">
                {name}
              </h6>

              <div className="flex flex-wrap gap-1">
                <Badge>{voteAverage?.toFixed(1)}</Badge>
              </div>
            </div>

            <p className="line-clamp-3 text-sm text-muted-foreground">
              {overview}
            </p>
          </div>
        </div>
      </DialogTrigger>

      <DialogContent className="max-h-[75vh] overflow-y-auto sm:max-w-[978px]">
        <DialogHeader className="text-start">
          <div className="flex items-center gap-4">
            <DialogTitle>{name}</DialogTitle>
          </div>

          <DialogDescription>{overview}</DialogDescription>
        </DialogHeader>

        <TvShowSeasonDetails seasonNumber={seasonNumber} tvShowID={tvShowID} />
      </DialogContent>
    </Dialog>
  )
}

export const TvShowSeasons = ({ seasons, tvShowID }: TvShowSeasonsProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {seasons.map((season) => (
        <TvShowSeason season={season} key={season.id} tvShowID={tvShowID} />
      ))}
    </div>
  )
}
