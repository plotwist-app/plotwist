'use client'

import { useCallback } from 'react'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'

import { usePathname, useRouter } from 'next/navigation'

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
import { ListForm } from '@/app/[lang]/lists/_components/list-form'

import { sanitizeListItem } from '@/utils/tmdb/list/list_item/sanitize'

import { List } from '@/types/supabase/lists'

import { MovieDetails } from '@/services/tmdb/requests/movies/details'
import { TvSeriesDetails } from '@/services/tmdb/requests/tv-series/details'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/auth'

type ListsDropdownProps = {
  item: MovieDetails | TvSeriesDetails
}

export const ListsDropdown = ({ item }: ListsDropdownProps) => {
  const { lists, handleAddToList, handleRemoveFromList } = useLists()
  const { push } = useRouter()
  const { user } = useAuth()
  const {
    dictionary: {
      lists_dropdown: {
        removed_successfully: removedSuccessfully,
        added_successfully: addedSuccessfully,
        view_list: viewList,
        add_to_list: addToList,
        my_lists: myLists,
      },
      list_form: { create_new_list: createNewList },
    },
    language,
  } = useLanguage()
  const pathname = usePathname()

  const handleRemove = useCallback(
    async (id: string) => {
      await handleRemoveFromList.mutateAsync(id, {
        onSuccess: () => {
          APP_QUERY_CLIENT.invalidateQueries({
            queryKey: LISTS_QUERY_KEY,
          })

          toast.success(removedSuccessfully)
        },
      })
    },
    [removedSuccessfully, handleRemoveFromList],
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

            toast.success(addedSuccessfully, {
              action: {
                label: viewList,
                onClick: () => push(`/${language}/lists/${list.id}`),
              },
            })
          },
        },
      )
    },
    [addedSuccessfully, handleAddToList, item, language, push, viewList],
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-6 px-2.5 py-0.5 text-xs">
          <Plus className="mr-2" size={12} />
          {addToList}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>{myLists}</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {lists?.length > 0 ? (
          lists.map((list) => {
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
          })
        ) : (
          <ListForm
            trigger={
              <div
                className={cn(
                  'flex cursor-pointer items-center justify-center rounded-md border border-dashed p-2 text-sm',
                  !user && 'pointer-events-none cursor-not-allowed opacity-50',
                )}
              >
                {createNewList}
              </div>
            }
          />
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
