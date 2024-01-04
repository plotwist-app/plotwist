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
import {
  LISTS_QUERY_CLIENT,
  LISTS_QUERY_KEY,
  useLists,
} from '@/context/lists/lists'
import { sanitizeListItem } from '@/utils/list/list_item/sanitize'
import { Plus } from 'lucide-react'
import { MovieDetails, TvShowDetails } from 'tmdb-ts'
import { toast } from 'sonner'
import { List } from '@/types/lists'
import { useCallback } from 'react'
import { useRouter } from 'next/navigation'

type AddToListButtonProps = {
  item: TvShowDetails | MovieDetails
}

export const AddToListButton = ({ item }: AddToListButtonProps) => {
  const { lists, handleAddToList, handleRemoveToList } = useLists()
  const { push } = useRouter()

  const handleRemove = useCallback(
    async (id: number) => {
      await handleRemoveToList.mutateAsync(id, {
        onSuccess: () => {
          LISTS_QUERY_CLIENT.invalidateQueries({
            queryKey: LISTS_QUERY_KEY,
          })

          toast.success(`Removed successfully.`)
        },
      })
    },
    [handleRemoveToList],
  )

  const handleAdd = useCallback(
    async (list: List) => {
      const sanitizedItem = sanitizeListItem(list.id, item)

      await handleAddToList.mutateAsync(
        { item: sanitizedItem },
        {
          onSuccess: () => {
            LISTS_QUERY_CLIENT.invalidateQueries({
              queryKey: LISTS_QUERY_KEY,
            })

            toast.success(`Added successfully.`, {
              action: {
                label: 'View list',
                onClick: () => push(`/app/lists/${list.id}`),
              },
            })
          },
        },
      )
    },
    [handleAddToList, item, push],
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-6 px-2.5 py-0.5 text-xs">
          <Plus className="mr-2" size={12} />
          Add to list
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>My lists</DropdownMenuLabel>
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
