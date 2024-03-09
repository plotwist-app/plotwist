import { ListItem } from '@/types/supabase/lists'
import { tmdbImage } from '@/utils/tmdb/image'
import Image from 'next/image'
import { Status } from './status'
import { ListItemActions } from './list-item-actions'

type ListItemCardProps = { listItem: ListItem }

export const ListItemCard = ({ listItem }: ListItemCardProps) => {
  const { poster_path: poster, title, status } = listItem

  return (
    <div className="space-y-2">
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-md border bg-background/50 shadow">
        {poster && (
          <Image
            fill
            className="z-10 object-cover"
            src={tmdbImage(poster, 'w500')}
            alt={title}
            sizes="100%"
          />
        )}
      </div>

      <div className="flex justify-between">
        <div className="z-20 flex gap-1">
          <Status status={status} />
        </div>

        <ListItemActions listItem={listItem} />
      </div>
    </div>
  )
}
