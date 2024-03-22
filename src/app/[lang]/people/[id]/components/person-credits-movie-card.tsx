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
import { Image as ImageIcon } from 'lucide-react'
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
      <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-md border">
        {/* <Badge className="absolute left-2 top-2 z-20">{mediaType}</Badge> */}

        {backdropPath ? (
          <Image
            src={tmdbImage(backdropPath || '', 'w500')}
            alt={title}
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
          <span className="text-sm">{title}</span>

          <div className="flex-end flex items-center gap-2">
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
          {role}
          {date && `, ${date.slice(0, 4)}`}
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
