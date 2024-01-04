import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { format } from 'date-fns'
import { MovieDetails } from 'tmdb-ts'

import { Separator } from '@/components/ui/separator'
import { WatchProviders } from '@/app/app/components/watch-providers'
import { AddToListButton } from '@/app/app/components/add-to-list-button'

type MovieDetailsInfoProps = {
  movie: MovieDetails
}

export const MovieDetailsInfo = ({ movie }: MovieDetailsInfoProps) => {
  const {
    vote_count: voteCount,
    vote_average: voteAverage,
    release_date: releaseDate,
    title,
    id,
    overview,
    genres,
  } = movie

  return (
    <article className="flex w-2/3 flex-col gap-2">
      <span className="text-xs text-muted-foreground">
        {format(new Date(releaseDate), 'PPP')}
      </span>

      <h1 className="text-4xl font-bold">{title}</h1>

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

      <div className="space-x-1">
        <WatchProviders id={id} variant="movies" />
        <AddToListButton item={movie} />
      </div>
    </article>
  )
}
