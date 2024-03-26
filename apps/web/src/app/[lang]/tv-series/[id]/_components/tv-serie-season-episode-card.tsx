import Image from 'next/image'
import { Image as ImageIcon } from 'lucide-react'
import { Episode } from '@plotwist/tmdb'

import {
  Badge,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@plotwist/ui'

import { tmdbImage } from '@/utils/tmdb/image'

type TvSerieEpisodeCardProps = {
  episode: Episode
}

export const TvSerieEpisodeCard = ({ episode }: TvSerieEpisodeCardProps) => {
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
      <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-md border">
        {path ? (
          <Image
            src={tmdbImage(path, 'w500')}
            alt={name}
            className="object-cover"
            loading="lazy"
            fill
            sizes="100%"
          />
        ) : (
          <ImageIcon className="text-muted" />
        )}
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
