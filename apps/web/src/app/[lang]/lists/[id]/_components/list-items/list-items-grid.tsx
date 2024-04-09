import { ListItem } from '@/types/supabase/lists'
import { ListItemCard } from './list-item-card'
import { ListCommand } from '../list-command'
import { useListMode } from '@/context/list-mode'

type ListItemsGridProps = {
  listItems: ListItem[]
}

export const ListItemsGrid = ({ listItems }: ListItemsGridProps) => {
  const { mode } = useListMode()

  return (
    <div className="grid grid-cols-3 gap-2 md:grid-cols-5">
      {listItems.map((item) => (
        <ListItemCard key={item.id} listItem={item} />
      ))}

      {mode === 'EDIT' && (
        <ListCommand variant="poster" listItems={listItems} />
      )}
    </div>
  )
}
