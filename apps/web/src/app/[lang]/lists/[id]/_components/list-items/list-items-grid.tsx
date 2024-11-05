'use client'

import { ListItem } from '@/types/supabase/lists'
import { ListItemCard } from './list-item-card'
import { ListCommand } from '../list-command'
import { useListMode } from '@/context/list-mode'
import { useEffect, useState } from 'react'
import { DndContext, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove } from '@dnd-kit/sortable'
import { handleUpdateOrderInDatabase } from '@/services/api/lists/update-list-order'

type ListItemsGridProps = {
  listItems: ListItem[]
  isEditable: boolean
}

export const ListItemsGrid = ({
  listItems,
  isEditable,
}: ListItemsGridProps) => {
  const { mode } = useListMode()

  const [selectedListItemId, setSelectedListItem] = useState<null | string>(
    null,
  )
  const [items, setItems] = useState<ListItem[]>([])

  useEffect(() => {
    setItems(listItems)
  }, [listItems])

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = listItems.findIndex((item) => item.id === active.id)
      const newIndex = listItems.findIndex((item) => item.id === over.id)

      const newItems = arrayMove([...listItems], oldIndex, newIndex)
      setItems(newItems)
      await handleUpdateOrderInDatabase(listItems, oldIndex, newIndex)
    }
  }

  return (
    <div>
      <div
        className={`grid grid-cols-3 gap-2 rounded-md ${isEditable ? 'border-2   p-1 md:grid-cols-5' : 'md:grid-cols-5'} transition-all duration-150 ease-in-out`}
      >
        {isEditable ? (
          <DndContext onDragEnd={handleDragEnd}>
            <SortableContext items={items}>
              {items.map((item) => (
                <ListItemCard
                  key={item.id}
                  listItem={item}
                  onClick={() => setSelectedListItem(item.id)}
                  showOverlay={selectedListItemId === item.id}
                  isEditable={isEditable}
                />
              ))}
              {mode === 'EDIT' && (
                <ListCommand variant="poster" listItems={listItems} />
              )}
            </SortableContext>
          </DndContext>
        ) : (
          <>
            {items.map((item) => (
              <ListItemCard
                key={item.id}
                listItem={item}
                onClick={() => setSelectedListItem(item.id)}
                showOverlay={selectedListItemId === item.id}
                isEditable={isEditable}
              />
            ))}

            {mode === 'EDIT' && (
              <ListCommand variant="poster" listItems={listItems} />
            )}
          </>
        )}
      </div>
    </div>
  )
}
