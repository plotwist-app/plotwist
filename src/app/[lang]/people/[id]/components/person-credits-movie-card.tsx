import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Credit } from '@/services/tmdb/requests/person/combined-credits'
import { tmdbImage } from '@/utils/tmdb/image'
import Image from 'next/image'

type PersonCreditsMovieCardProps = {
  credit: Credit
}

export const PersonCreditsMovieCard = ({ credit }: PersonCreditsMovieCardProps) => {
  const {
    backdrop_path,
    media_type,
    role,
    title,
    vote_average,
    vote_count
  } = credit

  return (
    <div className="space-y-2">
      <div className="relative aspect-video w-full overflow-hidden rounded-md border">
        <Image
          src={tmdbImage(backdrop_path || '', 'w500')}
          alt={title}
          className="object-cover"
          loading="lazy"
          fill
          sizes="100%"
        />
      </div>

      <div className="space-y-1">
        <div className="flex items-start justify-between gap-1">
          <span className="text-md">
            {title}
          </span>

          <div className='flex flex-end items-center'>
            <Badge variant="outline">{media_type}</Badge>

            {/* // FIX: tooltip not working when hovering */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge>{vote_average.toFixed(1)}</Badge>
                </TooltipTrigger>

                <TooltipContent>
                  <p>{vote_count} votes</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">{role}</p>
      </div>
    </div>
  )
}
