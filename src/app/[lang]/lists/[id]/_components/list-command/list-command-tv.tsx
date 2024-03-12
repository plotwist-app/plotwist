import { TvSerieWithMediaType } from '@/services/tmdb/types'
import { ListCommandGroup } from './list-command-group'
import { ListCommandItem } from './list-command-item'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { ExternalLink, MinusCircle, PlusCircle } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/context/language'
import { Skeleton } from '@/components/ui/skeleton'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { HoverCardPortal } from '@radix-ui/react-hover-card'
import Image from 'next/image'
import { tmdbImage } from '@/utils/tmdb/image'
import { ListItem } from '@/types/supabase/lists'
import { useCallback } from 'react'
import { sanitizeListItem } from '@/utils/tmdb/list/list_item'
import { useLists } from '@/context/lists'
import { useParams } from 'next/navigation'
import { APP_QUERY_CLIENT } from '@/context/app'
import { listPageQueryKey } from '@/utils/list'
import { toast } from 'sonner'

type ListCommandTvProps = {
  tv: TvSerieWithMediaType[]
  listItems: ListItem[]
}

export const ListCommandTv = ({ tv, listItems }: ListCommandTvProps) => {
  const { language, dictionary } = useLanguage()
  const { handleAddToList, handleRemoveFromList } = useLists()
  const listId = String(useParams().id)

  const isItemIncluded = useCallback(
    (tvSerieId: number) => {
      return listItems.some((listItem) => listItem.tmdb_id === tvSerieId)
    },
    [listItems],
  )

  const handleAdd = useCallback(
    async (tvSerie: TvSerieWithMediaType) => {
      const sanitizedItem = sanitizeListItem(listId, tvSerie)

      await handleAddToList.mutateAsync(
        { item: sanitizedItem },
        {
          onSuccess: () => {
            APP_QUERY_CLIENT.invalidateQueries({
              queryKey: listPageQueryKey(listId),
            })

            toast.success(dictionary.list_command.tv_added_success)
          },
        },
      )
    },
    [handleAddToList, listId, dictionary],
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

            toast.success(dictionary.list_command.tv_removed_success)
          },
        })
      }
    },
    [handleRemoveFromList, listId, listItems, dictionary],
  )

  return (
    <ListCommandGroup.Root>
      <ListCommandGroup.Label>TV Series</ListCommandGroup.Label>

      <ListCommandGroup.Items>
        {tv.map((tvSerie) => (
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
                {isItemIncluded(tvSerie.id) ? (
                  <DropdownMenuItem onClick={() => handleRemove(tvSerie.id)}>
                    <MinusCircle size={14} className="mr-1" />
                    Remove from list
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => handleAdd(tvSerie)}>
                    <PlusCircle size={14} className="mr-1" />
                    Add to list
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem asChild>
                  <Link href={`/${language}/tv-show/${tvSerie.id}`}>
                    <ExternalLink size={14} className="mr-1" />
                    View details
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
                <ListCommandItem.Banner>
                  {tvSerie.backdrop_path && (
                    <Image
                      src={tmdbImage(tvSerie.backdrop_path)}
                      alt={tvSerie.name}
                      fill
                    />
                  )}
                </ListCommandItem.Banner>

                <ListCommandItem.Information>
                  <ListCommandItem.Poster>
                    {tvSerie.poster_path && (
                      <Image
                        src={tmdbImage(tvSerie.poster_path, 'w500')}
                        alt={tvSerie.name}
                        fill
                        objectFit="cover"
                      />
                    )}
                  </ListCommandItem.Poster>

                  <ListCommandItem.Summary>
                    <ListCommandItem.Title>
                      {tvSerie.name}
                    </ListCommandItem.Title>

                    <ListCommandItem.Overview>
                      {tvSerie.overview}
                    </ListCommandItem.Overview>
                  </ListCommandItem.Summary>
                </ListCommandItem.Information>
              </HoverCardContent>
            </HoverCardPortal>
          </HoverCard>
        ))}
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
