import { ListItem } from '@/types/supabase/lists'
import { tmdbImage } from '@/utils/tmdb/image'
import Image from 'next/image'
import Link from 'next/link'
import { Status } from './status'
import { ListItemActions } from './list-item-actions'

type ListItemCardProps = { listItem: ListItem }

export const ListItemCard = ({ listItem }: ListItemCardProps) => {
  const {
    poster_path: poster,
    title,
    overview,
    tmdb_id: tmdbId,
    media_type: mediaType,
    status,
  } = listItem

  return (
    <Link
      href={`/app/${mediaType === 'TV_SHOW' ? 'tv-shows' : 'movies'}/${tmdbId}`}
      className="relative aspect-[2/3] w-full overflow-hidden rounded-md bg-background/50 shadow"
    >
      {poster && (
        <Image
          fill
          className="z-10 object-cover brightness-50 dark:brightness-[50%]"
          src={tmdbImage(poster, 'w500')}
          alt={title}
          sizes="100%"
        />
      )}

      <div className="absolute right-2 top-2 z-20 flex gap-1">
        <ListItemActions listItem={listItem} />
      </div>

      <div className="absolute bottom-2 left-2 z-20 flex gap-1">
        <Status status={status} />
      </div>
    </Link>
  )
}
