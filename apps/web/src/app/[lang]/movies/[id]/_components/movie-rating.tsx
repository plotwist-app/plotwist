import { badgeVariants } from '@plotwist/ui/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@plotwist/ui/components/ui/tooltip'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { MovieDetails } from '@/services/tmdb'

type MovieRatingProps = {
  movie: MovieDetails
  className?: string
}

export const MovieRating = ({ movie, className }: MovieRatingProps) => {
  const score = movie.vote_average.toFixed(1)

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={`TMDB ${score}/10 · ${movie.vote_count}`}
            className={cn(badgeVariants(), className)}
          >
            <Image
              src="/assets/tmdb.svg"
              width={50}
              height={1}
              alt="TMDB"
              className="mr-2"
            />

            {score}
          </button>
        </TooltipTrigger>

        <TooltipContent>
          <p>{movie.vote_count} votes</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
