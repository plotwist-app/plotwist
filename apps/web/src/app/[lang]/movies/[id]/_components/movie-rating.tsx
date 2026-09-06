import { Badge } from '@plotwist/ui/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@plotwist/ui/components/ui/tooltip'
import Image from 'next/image'
import type { MovieDetails } from '@/services/tmdb'

type MovieRatingProps = {
  movie: MovieDetails
  className?: string
}

export const MovieRating = ({ movie, className }: MovieRatingProps) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge className={className}>
          <Image
            src="/assets/tmdb.svg"
            width={50}
            height={1}
            alt="TMDB"
            className="mr-2"
          />

          {movie.vote_average.toFixed(1)}
        </Badge>
      </TooltipTrigger>

      <TooltipContent>
        <p>{movie.vote_count} votes</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
)
