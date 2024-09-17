import type {
  MovieWithMediaType,
  PersonWithMediaType,
  TvSerieWithMediaType,
} from '@plotwist/tmdb'
import Image from 'next/image'
import Link from 'next/link'
import { HoverCardPortal } from '@radix-ui/react-hover-card'

import { ItemHoverCard } from '../item-hover-card'

import type { Language } from '@/types/languages'
import { tmdbImage } from '@/utils/tmdb/image'

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@plotwist/ui/components/ui/hover-card'
import { Skeleton } from '@plotwist/ui/components/ui/skeleton'

type CommandSearchItemProps<T> = { language: Language; item: T }

export const CommandSearchMovie = ({
  item,
  language,
}: CommandSearchItemProps<MovieWithMediaType>) => {
  return (
    <HoverCard>
      <HoverCardTrigger>
        <Link
          href={`/${language}/movies/${item.id}`}
          className="flex cursor-pointer items-center justify-between gap-4 rounded-sm p-2 hover:bg-muted"
        >
          <span className="truncate whitespace-nowrap text-sm">
            {item.title}
          </span>

          <span className="whitespace-nowrap text-xs text-muted-foreground">
            {item.release_date !== '' &&
              new Date(item.release_date).getFullYear()}
          </span>
        </Link>
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

export const CommandSearchTvSerie = ({
  item,
  language,
}: CommandSearchItemProps<TvSerieWithMediaType>) => {
  return (
    <HoverCard>
      <HoverCardTrigger>
        <Link
          className="flex cursor-pointer items-center justify-between gap-4 rounded-sm p-2 hover:bg-muted"
          href={`/${language}/tv-series/${item.id}`}
        >
          <span className="truncate whitespace-nowrap text-sm">
            {item.name}
          </span>

          <span className="whitespace-nowrap text-xs text-muted-foreground">
            {item.first_air_date && new Date(item.first_air_date).getFullYear()}
          </span>
        </Link>
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

export const CommandSearchPerson = ({
  item,
  language,
}: CommandSearchItemProps<PersonWithMediaType>) => {
  return (
    <Link
      className="flex items-center gap-2 rounded-md px-2 py-2 hover:bg-muted"
      href={`/${language}/people/${item.id}`}
    >
      <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-muted-foreground">
        {item.profile_path ? (
          <Image
            fill
            className="object-cover"
            src={tmdbImage(item.profile_path)}
            alt={item.name}
            loading="lazy"
            sizes="100%"
          />
        ) : (
          item.name[0]
        )}
      </div>

      <span className="text-sm">{item.name}</span>
    </Link>
  )
}

export const CommandSearchSkeleton = () => (
  <div className="flex items-center justify-between gap-4 rounded-sm p-2">
    <Skeleton className="h-[2ex] w-[20ch]" />
    <Skeleton className="h-[2ex] w-[4ch]" />
  </div>
)
