import { AddToListButton } from '@/app/app/components/add-to-list-button'
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
  return (
    <article className="flex w-2/3 flex-col gap-2">
      <span className="text-xs text-muted-foreground">
        {format(new Date(tvShow.first_air_date), 'PPP')}
      </span>

      <h1 className="text-4xl font-bold">{tvShow.name}</h1>

      <div className="flex items-center gap-2">
        <div className="flex items-center space-x-1">
          {tvShow.genres.map((genre) => {
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
              <Badge>{tvShow.vote_average.toFixed(1)}</Badge>
            </TooltipTrigger>

            <TooltipContent>
              <p>{tvShow.vote_count} votes</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <p className="text-sm text-muted-foreground">{tvShow.overview}</p>

      <div className="space-x-1">
        <WatchProviders id={tvShow.id} variant="tvShows" />

        <AddToListButton item={tvShow} />
      </div>
    </article>
  )
}
