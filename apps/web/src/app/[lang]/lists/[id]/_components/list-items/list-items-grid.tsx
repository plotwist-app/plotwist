'use client'

import {
  getGetListItemsByListIdQueryKey,
  useDeleteListItemId,
  usePostListItem,
} from '@/api/list-item'
import { ListCommand } from '@/components/list-command'
import { APP_QUERY_CLIENT } from '@/context/app'
import { useLanguage } from '@/context/language'
import { useListMode } from '@/context/list-mode'
import { Plus } from 'lucide-react'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'
import { ListItemCard } from './list-item-card'
import type { GetListItemsByListId200Item } from '@/api/endpoints.schemas'

type ListItemsGridProps = {
  listItems: GetListItemsByListId200Item[]
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

  return (
    <div>
      <div
        className={`grid grid-cols-3 gap-2 rounded-md ${isEditable ? 'border-2   p-1 md:grid-cols-5' : 'md:grid-cols-5'} transition-all duration-150 ease-in-out`}
      >
        {listItems.map(item => (
          <ListItemCard key={item.id} listItem={item} />
        ))}

        {mode === 'EDIT' && (
          <ListCommand
            onAdd={(tmdbId, mediaType) =>
              postListItem.mutate(
                { data: { listId, mediaType, tmdbId } },
                {
                  onSuccess: async () => {
                    await APP_QUERY_CLIENT.invalidateQueries({
                      queryKey: getGetListItemsByListIdQueryKey(listId, {
                        language,
                      }),
                    })

                    toast.success(dictionary.list_command.movie_added_success)
                  },
                }
              )
            }
            onRemove={id =>
              deleteListItem.mutate(
                { id },
                {
                  onSuccess: async () => {
                    await APP_QUERY_CLIENT.invalidateQueries({
                      queryKey: getGetListItemsByListIdQueryKey(listId, {
                        language,
                      }),
                    })

                    toast.success(dictionary.list_command.movie_removed_success)
                  },
                }
              )
            }
            items={listItems}
            isPending={postListItem.isPending || deleteListItem.isPending}
          >
            <div className="flex aspect-poster cursor-pointer items-center justify-center rounded-md border border-dashed">
              <Plus />
            </div>
          </ListCommand>
        )}
      </div>
    </div>
  )
}
