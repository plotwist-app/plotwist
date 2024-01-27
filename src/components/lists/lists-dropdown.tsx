'use client'

import { useCallback } from 'react'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'

import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { LISTS_QUERY_KEY, useLists } from '@/context/lists'
import { APP_QUERY_CLIENT } from '@/context/app/app'
import { useLanguage } from '@/context/language'

import { sanitizeListItem } from '@/utils/tmdb/list/list_item/sanitize'

import { List } from '@/types/supabase/lists'

import { MovieDetails } from '@/services/tmdb/requests/movies/details'
import { TvSeriesDetails } from '@/services/tmdb/requests/tv-series/details'

type ListsDropdownProps = {
  item: MovieDetails | TvSeriesDetails
}

export const ListsDropdown = ({ item }: ListsDropdownProps) => {
  const { lists, handleAddToList, handleRemoveFromList } = useLists()
  const { push } = useRouter()
  const { dictionary } = useLanguage()

  const handleRemove = useCallback(
    async (id: number) => {
      await handleRemoveFromList.mutateAsync(id, {
        onSuccess: () => {
          APP_QUERY_CLIENT.invalidateQueries({
            queryKey: LISTS_QUERY_KEY,
          })

          toast.success(dictionary.lists_dropdown.removed_successfully)
        },
      })
    },
    [dictionary.lists_dropdown.removed_successfully, handleRemoveFromList],
  )

  const handleAdd = useCallback(
    async (list: List) => {
      const sanitizedItem = sanitizeListItem(list.id, item)

      await handleAddToList.mutateAsync(
        { item: sanitizedItem },
        {
          onSuccess: () => {
            APP_QUERY_CLIENT.invalidateQueries({
              queryKey: LISTS_QUERY_KEY,
            })

            toast.success(dictionary.lists_dropdown.added_successfully, {
              action: {
                label: dictionary.lists_dropdown.view_list,
                onClick: () => push(`/app/lists/${list.id}`),
              },
            })
          },
        },
      )
    },
    [dictionary, handleAddToList, item, push],
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-6 px-2.5 py-0.5 text-xs">
          <Plus className="mr-2" size={12} />

          {dictionary.lists_dropdown.add_to_list}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>
          {dictionary.lists_dropdown.my_lists}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {lists.map((list) => {
          const itemIncluded = list.list_items.find(
            ({ tmdb_id: tmdbId }) => tmdbId === item.id,
          )

          return (
            <DropdownMenuCheckboxItem
              className="cursor-pointer"
              key={list.id}
              checked={Boolean(itemIncluded)}
              onClick={() =>
                itemIncluded ? handleRemove(itemIncluded.id) : handleAdd(list)
              }
            >
              {list.name}
            </DropdownMenuCheckboxItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
