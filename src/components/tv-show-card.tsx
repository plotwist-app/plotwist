import { tmdbImage } from '@/utils/tmdb/image'
import Image from 'next/image'
import Link from 'next/link'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip'
import { Badge } from './ui/badge'
import { SimilarTvShow } from 'tmdb-ts'

type TvShowCardProps = {
  tvShow: SimilarTvShow
}

export const TvShowCard = ({ tvShow }: TvShowCardProps) => {
  const {
    name,
    id,
    backdrop_path: backdrop,
    vote_average: voteAverage,
    vote_count: voteCount,
    overview,
  } = tvShow

  if (!backdrop) return <></>

  return (
    <Link
      href={`/app/tv-shows/${id}`}
      className="w-full cursor-pointer space-y-2"
    >
      <div className="relative aspect-video w-full overflow-hidden rounded-md border bg-background/50 shadow">
        <Image
          fill
          className="object-cover"
          src={tmdbImage(backdrop, 'w500')}
          alt={name}
          sizes="100%"
        />
      </div>

      <div className="space-y-1">
        <div className="flex items-start justify-between">
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
