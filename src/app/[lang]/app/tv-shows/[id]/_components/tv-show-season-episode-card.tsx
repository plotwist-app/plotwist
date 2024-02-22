import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Episode } from '@/services/tmdb/requests/tv-seasons/details'
import { tmdbImage } from '@/utils/tmdb/image'
import Image from 'next/image'

type TvShowEpisodeCardProps = {
  episode: Episode
}

export const TvShowEpisodeCard = ({ episode }: TvShowEpisodeCardProps) => {
  const {
    name,
    still_path: path,
    overview,
    vote_average: voteAverage,
    vote_count: voteCount,
    episode_number: episodeNumber,
  } = episode

  return (
    <div className="space-y-2">
      <div className="relative aspect-video w-full overflow-hidden rounded-md border">
        <Image
          src={tmdbImage(path, 'w500')}
          alt={name}
          className="object-cover"
          loading="lazy"
          fill
          sizes="100%"
        />
      </div>

      <div className="space-y-1">
        <div className="flex items-start justify-between gap-1">
          <span className="text-md">
            <b className="text-sm">{episodeNumber}</b>. {name}
          </span>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline">{voteAverage.toFixed(1)}</Badge>
              </TooltipTrigger>

              <TooltipContent>
                <p>{voteCount} votes</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <p className="text-xs text-muted-foreground">{overview}</p>
      </div>
    </div>
  )
}
