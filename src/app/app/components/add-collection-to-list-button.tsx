'use client'

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
import { Plus } from 'lucide-react'
import { Movie } from 'tmdb-ts'
import { List } from '@/types/supabase/lists'
import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { APP_QUERY_CLIENT } from '@/context/app/app'
import { sanitizeListItem } from '@/utils/tmdb/list/list_item/sanitize'

const areAllItemsIncluded = (list: List, items: Movie[]) => {
  const included = items.every((item) =>
    list.list_items.some((listItem) => listItem.tmdb_id === item.id),
  )

  return included
}

const getIncludedItemIds = (list: List, items: Movie[]) => {
  return list.list_items
    .filter((listItem) => items.some((item) => item.id === listItem.tmdb_id))
    .map((listItem) => listItem.id)
}

type AddCollectionToListDropdownProps = {
  items: Movie[]
}

export const AddCollectionToListDropdown = ({
  items,
}: AddCollectionToListDropdownProps) => {
  const { lists, handleAddCollectionToList, handleRemoveCollectionToList } =
    useLists()
  const { push } = useRouter()

  const handleRemove = useCallback(
    async (ids: number[]) => {
      await handleRemoveCollectionToList.mutateAsync(
        {
          ids,
        },
        {
          onSuccess: () => {
            APP_QUERY_CLIENT.invalidateQueries({
              queryKey: LISTS_QUERY_KEY,
            })

            toast.success(`Collection removed successfully.`)
          },
        },
      )
    },
    [handleRemoveCollectionToList],
  )

  const handleAdd = useCallback(
    async (list: List) => {
      const sanitizedItems = items.map((item) =>
        sanitizeListItem(list.id, item),
      )

      await handleAddCollectionToList.mutateAsync(
        { items: sanitizedItems },
        {
          onSuccess: () => {
            APP_QUERY_CLIENT.invalidateQueries({
              queryKey: LISTS_QUERY_KEY,
            })

            toast.success(`Collection added successfully.`, {
              action: {
                label: 'View list',
                onClick: () => push(`/app/lists/${list.id}`),
              },
            })
          },
        },
      )
    },
    [handleAddCollectionToList, items, push],
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-6 px-2.5 py-0.5 text-xs">
          <Plus className="mr-2" size={12} />
          Add collection to list
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>My lists</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {lists.map((list) => {
          const itemsIncluded = areAllItemsIncluded(list, items)

          return (
            <DropdownMenuCheckboxItem
              className="cursor-pointer"
              key={list.id}
              checked={itemsIncluded}
              onClick={() =>
                itemsIncluded
                  ? handleRemove(getIncludedItemIds(list, items))
                  : handleAdd(list)
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
