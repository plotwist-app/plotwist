import Image from 'next/image'
import Link from 'next/link'
import { Movie, Recommendation } from 'tmdb-ts'
import { Skeleton } from './ui/skeleton'
import { Badge } from './ui/badge'
import { tmdbImage } from '@/utils/tmdb/image'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip'

type MovieCardProps = {
  movie: Movie | Recommendation
}

export const MovieCard = ({ movie }: MovieCardProps) => {
  const {
    title,
    backdrop_path: backdrop,
    overview,
    id,
    vote_average: voteAverage,
    vote_count: voteCount,
  } = movie

  if (!backdrop) return <></>

  return (
    <Link
      href={`/en-US/app/movies/${id}`}
      className="w-full cursor-pointer space-y-2"
      data-testid="movie-card"
    >
      <div className="relative aspect-video w-full overflow-hidden rounded-md border bg-background/50 shadow">
        <Image
          fill
          className="object-cover"
          src={tmdbImage(backdrop, 'w500')}
          alt={title}
          sizes="100%"
        />
      </div>

      <div className="space-y-1">
        <div className="flex items-start justify-between gap-1">
          <span className="">{title}</span>

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

export const MovieCardSkeleton = () => {
  return (
    <div className="w-full cursor-pointer space-y-2">
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
}
