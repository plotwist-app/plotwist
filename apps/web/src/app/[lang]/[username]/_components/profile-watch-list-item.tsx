import type { MovieWithMediaType, TvSerieWithMediaType } from '@plotwist/tmdb'
import Image from 'next/image'
import { HoverCardPortal } from '@radix-ui/react-hover-card'

import { ItemHoverCard } from '@/components/item-hover-card'

import type { Language } from '@/types/languages'
import { tmdbImage } from '@/utils/tmdb/image'

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@plotwist/ui/components/ui/hover-card'
import { Skeleton } from '@plotwist/ui/components/ui/skeleton'

type WatchListSearchItemProps<T> = {
  language: Language
  item: T
  handleAddToWatchList: (tmdbId: string, type: 'MOVIE' | 'TV') => void
}

export const WatchListSearchMovie = ({
  item,
  handleAddToWatchList,
}: WatchListSearchItemProps<MovieWithMediaType>) => {
  return (
    <HoverCard>
      <HoverCardTrigger>
        <button
          onClick={() => handleAddToWatchList(item.id.toString(), 'MOVIE')}
          className="w-full flex cursor-pointer items-center justify-between gap-4 rounded-sm p-2 hover:bg-muted"
        >
          <span className="truncate whitespace-nowrap text-sm">
            {item.title}
          </span>

          <span className="whitespace-nowrap text-xs text-muted-foreground">
            {item.release_date !== '' &&
              new Date(item.release_date).getFullYear()}
          </span>
        </button>
      </HoverCardTrigger>

      <HoverCardPortal>
        <HoverCardContent
          className="w-[320px] overflow-hidden rounded-lg p-0"
          side="top"
          align="start"
        >
          <ItemHoverCard.Banner>
            {item.backdrop_path && (
              <Image
                src={tmdbImage(item.backdrop_path)}
                alt={item.title}
                fill
              />
            )}
          </ItemHoverCard.Banner>

          <ItemHoverCard.Information>
            <ItemHoverCard.Poster>
              {item.poster_path && (
                <Image
                  src={tmdbImage(item.poster_path, 'w500')}
                  alt={item.title}
                  fill
                  objectFit="cover"
                />
              )}
            </ItemHoverCard.Poster>

            <ItemHoverCard.Summary>
              <ItemHoverCard.Title>{item.title}</ItemHoverCard.Title>

              <ItemHoverCard.Overview>{item.overview}</ItemHoverCard.Overview>
            </ItemHoverCard.Summary>
          </ItemHoverCard.Information>
        </HoverCardContent>
      </HoverCardPortal>
    </HoverCard>
  )
}

export const WatchListSearchTvSerie = ({
  item,
  handleAddToWatchList,
}: WatchListSearchItemProps<TvSerieWithMediaType>) => {
  return (
    <HoverCard>
      <HoverCardTrigger>
        <button
          onClick={() => handleAddToWatchList(item.id.toString(), 'TV')}
          className="w-full flex cursor-pointer items-center justify-between gap-4 rounded-sm p-2 hover:bg-muted"
        >
          <span className="truncate whitespace-nowrap text-sm">
            {item.name}
          </span>

          <span className="whitespace-nowrap text-xs text-muted-foreground">
            {item.first_air_date && new Date(item.first_air_date).getFullYear()}
          </span>
        </button>
      </HoverCardTrigger>

      <HoverCardPortal>
        <HoverCardContent
          className="w-[320px] overflow-hidden rounded-lg p-0"
          side="top"
          align="start"
        >
          <ItemHoverCard.Banner>
            {item.backdrop_path && (
              <Image src={tmdbImage(item.backdrop_path)} alt={item.name} fill />
            )}
          </ItemHoverCard.Banner>

          <ItemHoverCard.Information>
            <ItemHoverCard.Poster>
              {item.poster_path && (
                <Image
                  src={tmdbImage(item.poster_path, 'w500')}
                  alt={item.name}
                  fill
                  objectFit="cover"
                />
              )}
            </ItemHoverCard.Poster>

            <ItemHoverCard.Summary>
              <ItemHoverCard.Title>{item.name}</ItemHoverCard.Title>

              <ItemHoverCard.Overview>{item.overview}</ItemHoverCard.Overview>
            </ItemHoverCard.Summary>
          </ItemHoverCard.Information>
        </HoverCardContent>
      </HoverCardPortal>
    </HoverCard>
  )
}

export const WatchListSearchSkeleton = () => (
  <div className="flex items-center justify-between gap-4 rounded-sm p-2">
    <Skeleton className="h-[2ex] w-[20ch]" />
    <Skeleton className="h-[2ex] w-[4ch]" />
  </div>
)
