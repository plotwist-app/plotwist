import { WatchProviders } from '@/app/app/components/watch-providers'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { format } from 'date-fns'
import { ExternalLink } from 'lucide-react'
import { TvShowDetails } from 'tmdb-ts'

type TvShowDetailsInfoProps = {
  tvShow: TvShowDetails
}

export const TvShowDetailsInfo = ({ tvShow }: TvShowDetailsInfoProps) => {
  const {
    vote_count: voteCount,
    vote_average: voteAverage,
    first_air_date: releaseDate,
    name,
    homepage,
    overview,
    genres,
    id,
  } = tvShow

  return (
    <article className="flex w-2/3 flex-col gap-2">
      <div className="flex gap-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge>{voteAverage.toFixed(1)}</Badge>
            </TooltipTrigger>

            <TooltipContent>
              <p>{voteCount ?? 0} votes</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Badge variant="outline">{format(new Date(releaseDate), 'PPP')}</Badge>
      </div>

      <div className="flex items-center gap-2">
        <h1 className="text-3xl font-bold">{name}</h1>

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

        <WatchProviders id={id} variant="tvShows" />
      </div>
    </article>
  )
}
