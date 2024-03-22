import Image from 'next/image'
import Link from 'next/link'
import { forwardRef } from 'react'
import { Image as ImageIcon } from 'lucide-react'

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip'
import { Badge } from '../ui/badge'
import { Skeleton } from '../ui/skeleton'

import { Language } from '@/types/languages'
import { TvSerie } from '@/services/tmdb/types'
import { tmdbImage } from '@/utils/tmdb/image'

type TvSerieCardProps = {
  tvSerie: TvSerie
  language?: Language
}

export const TEST_ID = 'tv-show-card'

export const TvSerieCard = ({
  tvSerie,
  language = 'en-US',
}: TvSerieCardProps) => {
  const {
    name,
    id,
    backdrop_path: backdrop,
    vote_average: voteAverage,
    vote_count: voteCount,
    overview,
  } = tvSerie

  return (
    <Link
      href={`/${language}/tv-series/${id}`}
      className="w-full cursor-pointer space-y-2"
      data-testid={TEST_ID}
    >
      <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-md border bg-background/50 shadow">
        {backdrop ? (
          <Image
            fill
            className="object-cover"
            src={tmdbImage(backdrop, 'w500')}
            alt={name}
            sizes="100%"
          />
        ) : (
          <ImageIcon className="text-muted" />
        )}
      </div>

      <div className="space-y-1">
        <div className="flex items-start justify-between gap-2">
          <span className="">{name}</span>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Badge variant="outline">{voteAverage.toFixed(1)}</Badge>
              </TooltipTrigger>

              <TooltipContent>
                <p>{voteCount} votes</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <p className="line-clamp-3 text-xs text-muted-foreground">{overview}</p>
      </div>
    </Link>
  )
}

export const TvSerieCardSkeleton = forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <div className="w-full cursor-pointer space-y-2" ref={ref}>
      <Skeleton className="aspect-video w-full rounded-md border shadow" />

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-1">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-10" />
        </div>

        <div className="space-y-1">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-full" />
        </div>
      </div>
    </div>
  )
})
TvSerieCardSkeleton.displayName = 'TvSerieCardSkeleton'
