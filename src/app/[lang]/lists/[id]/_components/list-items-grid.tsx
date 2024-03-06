import { ListItem } from '@/types/supabase/lists'
import { ListItemCard } from './list-item-card'
import { Plus } from 'lucide-react'

type ListItemsGridProps = {
  listItems: ListItem[]
}

export const ListItemsGrid = ({ listItems }: ListItemsGridProps) => {
  return (
    <div className="grid grid-cols-3 gap-4 md:grid-cols-6">
      {listItems.map((item) => (
        <ListItemCard key={item.id} listItem={item} />
      ))}

      <div className="flex aspect-[2/3] w-full cursor-pointer items-center justify-center rounded-md border border-dashed">
        <Plus />
      </div>
    </div>
  )
}
