import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { format } from 'date-fns'
import { ExternalLink } from 'lucide-react'
import { MovieDetails } from 'tmdb-ts'
import { formatCurrency } from '@/utils/currency/format'
import { WatchProviders } from '@/app/app/components/watch-providers'

type MovieDetailsInfoProps = {
  movie: MovieDetails
}

export const MovieDetailsInfo = ({ movie }: MovieDetailsInfoProps) => {
  const {
    vote_count: voteCount,
    vote_average: voteAverage,
    release_date: releaseDate,
    title,
    homepage,
    overview,
    genres,
    budget,
    revenue,
    id,
  } = movie

  return (
    <article className="flex w-2/3 flex-col gap-2">
      <div className="flex gap-1">
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

        <Badge variant="outline">{format(new Date(releaseDate), 'PPP')}</Badge>
      </div>

      <div className="flex items-center gap-2">
        <h1 className="text-3xl font-bold">{title}</h1>

        {homepage !== '' && (
          <a target="_blank" href={homepage}>
            <ExternalLink width={20} className="text-muted-foreground" />
          </a>
        )}
      </div>

      <p className="text-sm text-muted-foreground">{overview}</p>

      <div className="mt-2 flex flex-wrap gap-1">
        {genres.map((genre) => {
          return (
            <Badge key={genre.id} variant="outline">
              {genre.name}
            </Badge>
          )
        })}

        <WatchProviders id={id} variant="movies" />
      </div>

      <div className="flex flex-wrap gap-1">
        {budget > 0 && (
          <Badge variant="outline">Budget: {formatCurrency(budget)}</Badge>
        )}

        {revenue > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Badge variant="outline">
                  Revenue: {formatCurrency(revenue)}
                </Badge>
              </TooltipTrigger>

              <TooltipContent>
                {formatCurrency(revenue - budget)}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </article>
  )
}
