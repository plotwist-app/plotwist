'use client'

import { ListItem } from '@/types/supabase/lists'
import { ListItemCard } from './list-item-card'
import { ListCommand } from '@/components/list-command'
import { useListMode } from '@/context/list-mode'
import { Plus } from 'lucide-react'
import {
  getGetListItemsByListIdQueryKey,
  useDeleteListItemId,
  usePostListItem,
} from '@/api/list-item'
import { useParams } from 'next/navigation'
import { APP_QUERY_CLIENT } from '@/context/app'
import { toast } from 'sonner'
import { useLanguage } from '@/context/language'

type ListItemsGridProps = {
  listItems: ListItem[]
  isEditable: boolean
}

export const ListItemsGrid = ({
  listItems,
  isEditable,
}: ListItemsGridProps) => {
  const { mode } = useListMode()
  const listId = String(useParams().id)

  const postListItem = usePostListItem()
  const deleteListItem = useDeleteListItemId()

  const { dictionary, language } = useLanguage()

  const Command = () => (
    <ListCommand
      onAdd={(tmdbId, mediaType) =>
        postListItem.mutate(
          { data: { listId, mediaType, tmdbId } },
          {
            onSuccess: async () => {
              await APP_QUERY_CLIENT.invalidateQueries({
                queryKey: getGetListItemsByListIdQueryKey(listId, { language }),
              })

              toast.success(dictionary.list_command.movie_added_success)
            },
          },
        )
      }
      onRemove={(id) =>
        deleteListItem.mutate(
          { id },
          {
            onSuccess: async () => {
              await APP_QUERY_CLIENT.invalidateQueries({
                queryKey: getGetListItemsByListIdQueryKey(listId, { language }),
              })

              toast.success(dictionary.list_command.movie_removed_success)
            },
          },
        )
      }
      items={listItems}
    >
      <div className="flex aspect-poster cursor-pointer items-center justify-center rounded-md border border-dashed">
        <Plus />
      </div>
    </ListCommand>
  )

  return (
    <div>
      <div
        className={`grid grid-cols-3 gap-2 rounded-md ${isEditable ? 'border-2   p-1 md:grid-cols-5' : 'md:grid-cols-5'} transition-all duration-150 ease-in-out`}
      >
        {listItems.map((item) => (
          <ListItemCard key={item.id} listItem={item} />
        ))}

        {mode === 'EDIT' && <Command />}
      </div>
    </div>
  )
}
