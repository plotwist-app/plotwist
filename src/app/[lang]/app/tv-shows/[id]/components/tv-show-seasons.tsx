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

import { TvShowSeasonDetails } from './tv-show-season-details'
import { Poster } from '@/components/poster'
import { Language } from '@/types/languages'
import { Season } from '@/services/tmdb2/requests/tv-series/details'

type TvShowSeasonsProps = {
  seasons: Season[]
  id: number
  language: Language
}

type TvShowSeasonProps = { season: Season; id: number; language: Language }

const TvShowSeason = ({ season, id, language }: TvShowSeasonProps) => {
  const {
    poster_path: poster,
    name,
    overview,
    vote_average: voteAverage,
    season_number: seasonNumber,
  } = season

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="group cursor-pointer space-y-2">
          <div className="w-full">
            <Poster url={tmdbImage(poster)} alt={name} />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between space-x-2 space-y-0">
              <h6 className="underline-offset-1.5 text-sm group-hover:underline">
                {name}
              </h6>

              <div>
                <Badge variant="outline">{voteAverage?.toFixed(1)}</Badge>
              </div>
            </div>

            <p className="line-clamp-3 text-xs text-muted-foreground">
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

        <TvShowSeasonDetails
          seasonNumber={seasonNumber}
          id={id}
          language={language}
        />
      </DialogContent>
    </Dialog>
  )
}

export const TvShowSeasons = ({
  seasons,
  id,
  language,
}: TvShowSeasonsProps) => {
  return (
    <div className="grid grid-cols-4 gap-x-4 gap-y-8">
      {seasons.map((season) => (
        <TvShowSeason
          season={season}
          key={season.id}
          id={id}
          language={language}
        />
      ))}
    </div>
  )
}
