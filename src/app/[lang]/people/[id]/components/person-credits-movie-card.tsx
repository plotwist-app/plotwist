import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Credit } from '@/services/tmdb/requests/person/combined-credits'
import { tmdbImage } from '@/utils/tmdb/image'
import { Calendar } from 'lucide-react'
import Image from 'next/image'

type PersonCreditsMovieCardProps = {
  credit: Credit
}

export const PersonCreditsMovieCard = ({
  credit,
}: PersonCreditsMovieCardProps) => {
  const {
    backdrop_path: backdropPath,
    media_type: mediaType,
    role,
    title,
    vote_average: voteAverage,
    vote_count: voteCount,
    date,
  } = credit

  return (
    <div className="space-y-2">
      <div className="relative aspect-video w-full overflow-hidden rounded-md border">
        <Image
          src={tmdbImage(backdropPath || '', 'w500')}
          alt={title}
          className="object-cover"
          loading="lazy"
          fill
          sizes="100%"
        />
      </div>

      <div className="space-y-1">
        <div className="flex items-start justify-between gap-1">
          <span className="text-md">{title}</span>

          <div className="flex-end flex items-center gap-2">
            <Badge variant="outline">{mediaType}</Badge>

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
        </div>

        <p className="text-xs text-muted-foreground">
          {date && (
            <div className="flex items-center justify-between gap-1">
              {role}
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {date.slice(0, 4)}
              </div>
            </div>
          )}
        </p>
      </div>
    </div>
  )
}

export function PersonCreditsMovieCardSkeleton() {
  return (
    <div className="w-full cursor-pointer space-y-2">
      <Skeleton className="aspect-video w-full rounded-md shadow" />

      <div className="space-y-2">
        <Skeleton className="h-[2ex] w-[10ch]" />

        <div className="space-y-1">
          <Skeleton className="h-[1.2ex] w-full" />
        </div>
      </div>
    </div>
  )
}
