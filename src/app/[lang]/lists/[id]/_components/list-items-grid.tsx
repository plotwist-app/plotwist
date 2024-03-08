import { ListItem } from '@/types/supabase/lists'
import { ListItemCard } from './list-item-card'
import { ListCommand } from './list-command'

type ListItemsGridProps = {
  listItems: ListItem[]
}

export const ListItemsGrid = ({ listItems }: ListItemsGridProps) => {
  return (
    <div className="grid grid-cols-3 gap-4 md:grid-cols-6">
      {listItems.map((item) => (
        <ListItemCard key={item.id} listItem={item} />
      ))}

      <ListCommand variant="poster" />
    </div>
  )
}
