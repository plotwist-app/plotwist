import { WatchProviders } from '@/app/app/components/watch-providers'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { format } from 'date-fns'
import { TvShowDetails } from 'tmdb-ts'

type TvShowDetailsInfoProps = {
  tvShow: TvShowDetails
}

export const TvShowDetailsInfo = ({ tvShow }: TvShowDetailsInfoProps) => {
  const {
    vote_count: voteCount,
    vote_average: voteAverage,
    first_air_date: firstAirDate,
    name,
    overview,
    genres,
    id,
  } = tvShow

  return (
    <article className="flex w-2/3 flex-col gap-2">
      <span className="text-xs text-muted-foreground">
        {format(new Date(firstAirDate), 'PPP')}
      </span>

      <h1 className="text-4xl font-bold">{name}</h1>

      <div className="flex items-center gap-2">
        <div className="flex items-center space-x-1">
          {genres.map((genre) => {
            return (
              <Badge key={genre.id} variant="outline">
                {genre.name}
              </Badge>
            )
          })}
        </div>

        <Separator orientation="vertical" className="h-6" />

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge>{voteAverage.toFixed(1)}</Badge>
            </TooltipTrigger>

            <TooltipContent>
              <p>{voteCount} votes</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <p className="text-sm text-muted-foreground">{overview}</p>

      <div>
        <WatchProviders id={id} variant="tvShows" />
      </div>
    </article>
  )
}
