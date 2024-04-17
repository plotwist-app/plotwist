import { ListItem } from '@/types/supabase/lists'
import { ListItemCard } from './list-item-card'
import { ListCommand } from '../list-command'
import { useListMode } from '@/context/list-mode'
import { useState } from 'react'

type ListItemsGridProps = {
  listItems: ListItem[]
}

export const ListItemsGrid = ({ listItems }: ListItemsGridProps) => {
  const { mode } = useListMode()
  const [selectedListItemId, setSelectedListItem] = useState<null | string>(
    null,
  )

  return (
    <div className="grid grid-cols-3 gap-2 md:grid-cols-5">
      {listItems.map((listItem) => (
        <ListItemCard
          key={listItem.id}
          listItem={listItem}
          onClick={() => setSelectedListItem(listItem.id)}
          showOverlay={selectedListItemId === listItem.id}
        />
      ))}

      {mode === 'EDIT' && (
        <ListCommand variant="poster" listItems={listItems} />
      )}
    </div>
  )
}
