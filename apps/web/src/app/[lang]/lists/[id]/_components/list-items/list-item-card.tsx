import { ListItem } from '@/types/supabase/lists'
import { tmdbImage } from '@/utils/tmdb/image'
import Image from 'next/image'
import { ListItemActions } from './list-item-actions'
import { Status } from '../status'

type ListItemCardProps = { listItem: ListItem }

export const ListItemCard = ({ listItem }: ListItemCardProps) => {
  const { poster_path: poster, title, status } = listItem

  return (
    <div className="group space-y-2">
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

        <div className="absolute z-20 h-full w-full bg-gradient-to-b from-black to-black/50 opacity-0 transition-all group-hover:opacity-100" />

        <div className="absolute left-2 top-2 z-30 flex scale-0 gap-1 transition-all group-hover:scale-100">
          <Status status={status} />
        </div>

        <div className="absolute right-2 top-2 z-30 flex scale-0 gap-1 transition-all group-hover:scale-100">
          <ListItemActions listItem={listItem} />
        </div>
      </div>
    </div>
  )
}
