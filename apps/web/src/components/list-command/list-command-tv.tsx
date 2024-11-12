import Link from 'next/link'
import { ExternalLink, MinusCircle, PlusCircle } from 'lucide-react'
import Image from 'next/image'
import { HoverCardPortal } from '@radix-ui/react-hover-card'

import { DropdownMenuItem } from '@plotwist/ui/components/ui/dropdown-menu'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@plotwist/ui/components/ui/hover-card'
import { Skeleton } from '@plotwist/ui/components/ui/skeleton'
import { ItemHoverCard } from '@/components/item-hover-card'

import { useLanguage } from '@/context/language'

import { tmdbImage } from '@/utils/tmdb/image'

import { ListCommandGroup } from './list-command-group'
import { ListCommandItem } from './list-command-item'
import { ListCommandProps } from './list-command'

import { TvSerieWithMediaType } from '@/services/tmdb'

type ListCommandTvProps = {
  tv: TvSerieWithMediaType[]
} & Pick<ListCommandProps, 'onAdd' | 'onRemove' | 'items'>

export const ListCommandTv = ({
  tv,
  items,
  onAdd,
  onRemove,
}: ListCommandTvProps) => {
  const { language, dictionary } = useLanguage()

  return (
    <ListCommandGroup.Root>
      <ListCommandGroup.Label>TV Series</ListCommandGroup.Label>

      <ListCommandGroup.Items>
        {tv.map((tvSerie) => {
          const includedItem = items.find(
            (listItem) => listItem.tmdbId === tvSerie.id,
          )

          return (
            <HoverCard key={tvSerie.id}>
              <ListCommandItem.Root>
                <HoverCardTrigger>
                  <ListCommandItem.Label>
                    {tvSerie.name}

                    {tvSerie.first_air_date !== '' && (
                      <ListCommandItem.Year>
                        • {new Date(tvSerie.first_air_date).getFullYear()}
                      </ListCommandItem.Year>
                    )}
                  </ListCommandItem.Label>
                </HoverCardTrigger>

                <ListCommandItem.Dropdown>
                  {includedItem ? (
                    <DropdownMenuItem onClick={() => onRemove(includedItem.id)}>
                      <MinusCircle size={14} className="mr-1" />
                      {dictionary.list_command.remove_from_list}
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      onClick={() => onAdd(tvSerie.id, 'TV_SHOW')}
                    >
                      <PlusCircle size={14} className="mr-1" />
                      {dictionary.add_to_list}
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem asChild>
                    <Link href={`/${language}/tv-series/${tvSerie.id}`}>
                      <ExternalLink size={14} className="mr-1" />
                      {dictionary.list_command.view_details}
                    </Link>
                  </DropdownMenuItem>
                </ListCommandItem.Dropdown>
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
                          objectFit="cover"
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
        {Array.from({ length: 5 }).map((_, index) => (
          <ListCommandItem.Root key={index}>
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
