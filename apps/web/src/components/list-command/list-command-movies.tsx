'use client'

import { Minus, Plus } from 'lucide-react'
import Image from 'next/image'
import { Link } from 'next-view-transitions'

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@plotwist/ui/components/ui/hover-card'
import { Skeleton } from '@plotwist/ui/components/ui/skeleton'

import { ItemHoverCard } from '@/components/item-hover-card'

import { useLanguage } from '@/context/language'
import { tmdbImage } from '@/utils/tmdb/image'

import { HoverCardPortal } from '@radix-ui/react-hover-card'
import { ListCommandGroup } from './list-command-group'
import { ListCommandItem } from './list-command-item'

import type { MovieWithMediaType } from '@/services/tmdb'
import { Button } from '@plotwist/ui/components/ui/button'
import { v4 } from 'uuid'
import type { ListCommandProps } from './list-command'

type ListCommandMoviesProps = {
  movies: MovieWithMediaType[]
} & Pick<ListCommandProps, 'onAdd' | 'onRemove' | 'items' | 'isPending'>

export const ListCommandMovies = ({
  movies,
  items,
  onAdd,
  onRemove,
  isPending,
}: ListCommandMoviesProps) => {
  const { language, dictionary } = useLanguage()

  return (
    <ListCommandGroup.Root>
      <ListCommandGroup.Label>{dictionary.movies}</ListCommandGroup.Label>

      <ListCommandGroup.Items>
        {movies.map(movie => {
          const includedItem = items.find(
            listItem => listItem.tmdbId === movie.id
          )

          return (
            <HoverCard key={movie.id}>
              <ListCommandItem.Root>
                <HoverCardTrigger>
                  <ListCommandItem.Label>
                    <Link
                      href={`/${language}/movies/${movie.id}`}
                      className="whitespace-nowrap max-w-[30ch] truncate hover:underline"
                    >
                      {movie.title}
                    </Link>

                    {movie.release_date !== '' && (
                      <ListCommandItem.Year>
                        • {new Date(movie.release_date).getFullYear()}
                      </ListCommandItem.Year>
                    )}
                  </ListCommandItem.Label>
                </HoverCardTrigger>

                <Button
                  size="icon"
                  variant="outline"
                  onClick={() =>
                    includedItem
                      ? onRemove(includedItem.id)
                      : onAdd(movie.id, 'MOVIE')
                  }
                  className="size-5"
                  disabled={isPending}
                >
                  {includedItem ? <Minus size={14} /> : <Plus size={14} />}
                </Button>
              </ListCommandItem.Root>

              <HoverCardPortal>
                <HoverCardContent
                  className="w-[320px] overflow-hidden rounded-lg p-0"
                  side="top"
                  align="start"
                >
                  <ItemHoverCard.Banner>
                    {movie.backdrop_path && (
                      <Image
                        src={tmdbImage(movie.backdrop_path)}
                        alt={movie.title}
                        fill
                      />
                    )}
                  </ItemHoverCard.Banner>

                  <ItemHoverCard.Information>
                    <ItemHoverCard.Poster>
                      {movie.poster_path && (
                        <Image
                          src={tmdbImage(movie.poster_path, 'w500')}
                          alt={movie.title}
                          fill
                          objectFit="cover"
                        />
                      )}
                    </ItemHoverCard.Poster>

                    <ItemHoverCard.Summary>
                      <ItemHoverCard.Title>{movie.title}</ItemHoverCard.Title>

                      <ItemHoverCard.Overview>
                        {movie.overview}
                      </ItemHoverCard.Overview>
                    </ItemHoverCard.Summary>
                  </ItemHoverCard.Information>
                </HoverCardContent>
              </HoverCardPortal>
            </HoverCard>
          )
        })}
      </ListCommandGroup.Items>
    </ListCommandGroup.Root>
  )
}

export const ListCommandMoviesSkeleton = () => {
  const { dictionary } = useLanguage()

  return (
    <ListCommandGroup.Root>
      <ListCommandGroup.Label>{dictionary.movies}</ListCommandGroup.Label>

      <ListCommandGroup.Items>
        {Array.from({ length: 5 }).map((_, index) => (
          <ListCommandItem.Root key={v4()}>
            <ListCommandItem.Label>
              <Skeleton className="h-[1.5ex] w-[30ch]" />

              <ListCommandItem.Year>
                • <Skeleton className="h-[1.5ex] w-[4ch]" />
              </ListCommandItem.Year>
            </ListCommandItem.Label>

            <Skeleton className="h-5 w-5" />
          </ListCommandItem.Root>
        ))}
      </ListCommandGroup.Items>
    </ListCommandGroup.Root>
  )
}
