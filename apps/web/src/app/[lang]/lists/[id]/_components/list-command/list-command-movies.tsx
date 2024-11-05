'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ExternalLink, PlusCircle, MinusCircle } from 'lucide-react'
import { useCallback } from 'react'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'

import { MovieWithMediaType } from '@plotwist/tmdb'

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@plotwist/ui/components/ui/hover-card'
import { DropdownMenuItem } from '@plotwist/ui/components/ui/dropdown-menu'
import { Skeleton } from '@plotwist/ui/components/ui/skeleton'

import { ItemHoverCard } from '@/components/item-hover-card'

import { tmdbImage } from '@/utils/tmdb/image'
import { useLanguage } from '@/context/language'

import { ListCommandGroup } from './list-command-group'
import { ListCommandItem } from './list-command-item'
import { HoverCardPortal } from '@radix-ui/react-hover-card'
import { useLists } from '@/context/lists'
import { ListItem } from '@/types/supabase/lists'
import { sanitizeListItem } from '@/utils/tmdb/list/list_item'

import { APP_QUERY_CLIENT } from '@/context/app'
import { listPageQueryKey } from '@/utils/list'
import { usePostListItem } from '@/api/list-item'

type ListCommandMoviesProps = {
  movies: MovieWithMediaType[]
  listItems: ListItem[]
}

export const ListCommandMovies = ({
  movies,
  listItems,
}: ListCommandMoviesProps) => {
  const { language, dictionary } = useLanguage()
  const { mutateAsync } = usePostListItem()
  const { handleRemoveFromList } = useLists()
  const listId = String(useParams().id)

  const isItemIncluded = useCallback(
    (movieId: number) => {
      return listItems.some((listItem) => listItem.tmdb_id === movieId)
    },

    [listItems],
  )

  const handleAdd = useCallback(
    async (movie: MovieWithMediaType) => {
      const sanitizedItem = sanitizeListItem(listId, movie)

      await mutateAsync(
        { data: sanitizedItem },
        {
          onSuccess: () => {
            APP_QUERY_CLIENT.invalidateQueries({
              queryKey: listPageQueryKey(listId),
            })

            toast.success(dictionary.list_command.movie_added_success)
          },
        },
      )
    },
    [dictionary, listId, mutateAsync],
  )

  const handleRemove = useCallback(
    async (tmdbId: number) => {
      const listItemToRemove = listItems.find(
        (listItem) => listItem.tmdb_id === tmdbId,
      )

      if (listItemToRemove) {
        await handleRemoveFromList.mutateAsync(listItemToRemove.id, {
          onSuccess: () => {
            APP_QUERY_CLIENT.invalidateQueries({
              queryKey: listPageQueryKey(listId),
            })

            toast.success(dictionary.list_command.movie_removed_success)
          },
        })
      }
    },
    [dictionary, handleRemoveFromList, listId, listItems],
  )

  return (
    <ListCommandGroup.Root>
      <ListCommandGroup.Label>
        {dictionary.list_command.movies_label}
      </ListCommandGroup.Label>

      <ListCommandGroup.Items>
        {movies.map((movie) => (
          <HoverCard key={movie.id} openDelay={0} closeDelay={0}>
            <ListCommandItem.Root>
              <HoverCardTrigger>
                <ListCommandItem.Label>
                  {movie.title}

                  {movie.release_date !== '' && (
                    <ListCommandItem.Year>
                      • {new Date(movie.release_date).getFullYear()}
                    </ListCommandItem.Year>
                  )}
                </ListCommandItem.Label>
              </HoverCardTrigger>

              <ListCommandItem.Dropdown>
                {isItemIncluded(movie.id) ? (
                  <DropdownMenuItem onClick={() => handleRemove(movie.id)}>
                    <MinusCircle size={14} className="mr-1" />
                    {dictionary.list_command.remove_from_list}
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => handleAdd(movie)}>
                    <PlusCircle size={14} className="mr-1" />
                    {dictionary.add_to_list}
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem asChild>
                  <Link href={`/${language}/movies/${movie.id}`}>
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
        ))}
      </ListCommandGroup.Items>
    </ListCommandGroup.Root>
  )
}

export const ListCommandMoviesSkeleton = () => {
  const { dictionary } = useLanguage()

  return (
    <ListCommandGroup.Root>
      <ListCommandGroup.Label>
        {dictionary.list_command.movies_label}
      </ListCommandGroup.Label>

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
