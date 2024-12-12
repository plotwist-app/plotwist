'use client'

import {
  getGetListItemsByListIdQueryKey,
  useDeleteListItemId,
  usePostListItem,
  useUpdateListItemsPositions,
} from '@/api/list-item'
import { ListCommand } from '@/components/list-command'
import { APP_QUERY_CLIENT } from '@/context/app'
import { useLanguage } from '@/context/language'
import { useListMode } from '@/context/list-mode'
import { Grip, Plus } from 'lucide-react'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'
import { ListItemCard } from './list-item-card'
import type { GetListItemsByListId200Item } from '@/api/endpoints.schemas'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

import { DndContext, type DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext } from '@dnd-kit/sortable'
import { Button } from '@plotwist/ui/components/ui/button'

type ListItem = GetListItemsByListId200Item

type ListItemsGridProps = {
  listItems: ListItem[]
}

export const ListItemsGrid = ({ listItems }: ListItemsGridProps) => {
  const { mode } = useListMode()
  const listId = String(useParams().id)

  const postListItem = usePostListItem()
  const deleteListItem = useDeleteListItemId()
  const updateListItemsPositions = useUpdateListItemsPositions()

  const { dictionary, language } = useLanguage()

  const [items, setItems] = useState<ListItem[]>([])
  const [isEditingOrder, setIsEditingOrder] = useState(false)

  useEffect(() => {
    setItems(listItems)
  }, [listItems])

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex(item => item.id === active.id)
      const newIndex = items.findIndex(item => item.id === over.id)
      const newItems = arrayMove([...items], oldIndex, newIndex)

      setItems(newItems)

      await updateListItemsPositions.mutateAsync({
        data: {
          listItems: newItems.map((item, idx) => ({
            id: item.id,
            position: idx,
          })),
        },
      })
    }
  }

  return (
    <div className="space-y-2">
      <Button
        size="sm"
        variant="outline"
        onClick={() => setIsEditingOrder(!isEditingOrder)}
        className="ml-auto"
      >
        <Grip size={14} className="mr-1" />
        {isEditingOrder ? dictionary.save_order : dictionary.edit_order}
      </Button>

      <div
        className={cn(
          'grid grid-cols-3 gap-2 rounded-md transition-all duration-150 ease-in-out md:grid-cols-5'
        )}
      >
        {isEditingOrder ? (
          <DndContext onDragEnd={handleDragEnd}>
            <SortableContext items={items}>
              {items.map(item => (
                <ListItemCard
                  key={item.id}
                  listItem={item}
                  isEditingOrder={isEditingOrder}
                />
              ))}
            </SortableContext>
          </DndContext>
        ) : (
          <>
            {items.map(item => (
              <ListItemCard
                key={item.id}
                listItem={item}
                isEditingOrder={isEditingOrder}
              />
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

                        toast.success(
                          dictionary.list_command.movie_added_success
                        )
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

                        toast.success(
                          dictionary.list_command.movie_removed_success
                        )
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
          </>
        )}
      </div>
    </div>
  )
}
