import { ListItem } from '@/types/supabase/lists'
import { ListItemCard } from './list-item-card'

type ListItemsGridProps = {
  listItems: ListItem[]
}

export const ListItemsGrid = ({ listItems }: ListItemsGridProps) => {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3">
      {listItems.map((item) => (
        <ListItemCard key={item.id} listItem={item} />
      ))}
    </div>
  )
}
