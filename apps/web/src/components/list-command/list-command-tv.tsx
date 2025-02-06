import { HoverCardPortal } from '@radix-ui/react-hover-card'
import { Minus, Plus } from 'lucide-react'
import Image from 'next/image'
import { Link } from 'next-view-transitions'

import { ItemHoverCard } from '@/components/item-hover-card'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@plotwist/ui/components/ui/hover-card'
import { Skeleton } from '@plotwist/ui/components/ui/skeleton'

import { useLanguage } from '@/context/language'

import { tmdbImage } from '@/utils/tmdb/image'

import type { ListCommandProps } from './list-command'
import { ListCommandGroup } from './list-command-group'
import { ListCommandItem } from './list-command-item'

import type { TvSerieWithMediaType } from '@/services/tmdb'
import { Button } from '@plotwist/ui/components/ui/button'
import { v4 } from 'uuid'

type ListCommandTvProps = {
  tv: TvSerieWithMediaType[]
} & Pick<ListCommandProps, 'onAdd' | 'onRemove' | 'items' | 'isPending'>

export const ListCommandTv = ({
  tv,
  items,
  onAdd,
  onRemove,
  isPending,
}: ListCommandTvProps) => {
  const { language, dictionary } = useLanguage()

  return (
    <ListCommandGroup.Root>
      <ListCommandGroup.Label>{dictionary.tv_series}</ListCommandGroup.Label>

      <ListCommandGroup.Items>
        {tv.map(tvSerie => {
          const includedItem = items.find(
            listItem => listItem.tmdbId === tvSerie.id
          )

          return (
            <HoverCard key={tvSerie.id}>
              <ListCommandItem.Root>
                <HoverCardTrigger>
                  <ListCommandItem.Label>
                    <Link
                      href={`/${language}/tv-series/${tvSerie.id}`}
                      className="whitespace-nowrap max-w-[30ch] truncate hover:underline"
                    >
                      {tvSerie.name}
                    </Link>

                    {tvSerie.first_air_date !== '' && (
                      <ListCommandItem.Year>
                        • {new Date(tvSerie.first_air_date).getFullYear()}
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
                      : onAdd(tvSerie.id, 'TV_SHOW')
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
                    {tvSerie.backdrop_path && (
                      <Image
                        src={tmdbImage(tvSerie.backdrop_path)}
                        alt={tvSerie.name}
                        fill
                      />
                    )}
                  </ItemHoverCard.Banner>

                  <ItemHoverCard.Information>
                    <ItemHoverCard.Poster>
                      {tvSerie.poster_path && (
                        <Image
                          src={tmdbImage(tvSerie.poster_path, 'w500')}
                          alt={tvSerie.name}
                          fill
                          style={{ objectFit: 'cover' }}
                        />
                      )}
                    </ItemHoverCard.Poster>

                    <ItemHoverCard.Summary>
                      <ItemHoverCard.Title>{tvSerie.name}</ItemHoverCard.Title>

                      <ItemHoverCard.Overview>
                        {tvSerie.overview}
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

export const ListCommandTvSkeleton = () => {
  return (
    <ListCommandGroup.Root>
      <ListCommandGroup.Label>TV Series</ListCommandGroup.Label>

      <ListCommandGroup.Items>
        {Array.from({ length: 5 }).map(_ => (
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
