import { ListItem } from '@/types/supabase/lists'
import { ListItemCard } from './list-item-card'

type ListItemsGridProps = {
  listItems: ListItem[]
}

export const ListItemsGrid = ({ listItems }: ListItemsGridProps) => {
  return (
    <div className="grid grid-cols-3 gap-4 md:grid-cols-5">
      {listItems.map((item) => (
        <ListItemCard key={item.id} listItem={item} />
      ))}
    </div>
  )
}
