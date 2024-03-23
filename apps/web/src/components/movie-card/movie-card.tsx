import Image from 'next/image'
import Link from 'next/link'
import { forwardRef } from 'react'
import { Image as ImageIcon } from 'lucide-react'
import { Movie } from '@plotwist/tmdb'

import { Language } from '@/types/languages'
import { tmdbImage } from '@/utils/tmdb/image'

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip'
import { Badge } from '../ui/badge'
import { Skeleton } from '../ui/skeleton'

type MovieCardProps = {
  movie: Movie
  language?: Language
}

export const MovieCard = ({ movie, language = 'en-US' }: MovieCardProps) => {
  const {
    title,
    backdrop_path: backdrop,
    overview,
    id,
    vote_average: voteAverage,
    vote_count: voteCount,
  } = movie

  return (
    <Link
      href={`/${language}/movies/${id}`}
      className="w-full cursor-pointer space-y-2"
      data-testid="movie-card"
    >
      <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-md border bg-background/50 shadow">
        {backdrop ? (
          <Image
            fill
            className="object-cover"
            src={tmdbImage(backdrop, 'w500')}
            alt={title}
            sizes="100%"
          />
        ) : (
          <ImageIcon className="text-muted" />
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-start justify-between gap-1">
          <span className="">{title}</span>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Badge variant="outline">
                  {voteAverage ? voteAverage.toFixed(1) : '?'}
                </Badge>
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

export const MovieCardSkeleton = forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <div className="w-full cursor-pointer space-y-2" ref={ref}>
      <Skeleton className="aspect-video w-full rounded-md border shadow" />

      <div className="space-y-2">
        <div className="flex justify-between gap-1">
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
MovieCardSkeleton.displayName = 'MovieCardSkeleton'
