import { ListItem } from '@/types/lists'
import { tmdbImage } from '@/utils/tmdb/image'
import Image from 'next/image'
import Link from 'next/link'
import { Status } from './status'
import { ListItemActions } from './list-item-actions'

type ListItemCardProps = { listItem: ListItem }

export const ListItemCard = ({ listItem }: ListItemCardProps) => {
  const {
    backdrop_path: backdrop,
    title,
    overview,
    tmdb_id: tmdbId,
    media_type: mediaType,
    status,
  } = listItem

  return (
    <div className="w-full space-y-2">
      <div className="flex">
        <Status status={status} />
      </div>

      <div className="relative aspect-video w-full overflow-hidden rounded-md border bg-background/50 shadow">
        <Image
          fill
          className="object-cover"
          src={tmdbImage(backdrop, 'w500')}
          alt={title}
          sizes="100%"
        />
      </div>

      <div className="space-y-1">
        <div className="flex items-start justify-between gap-1">
          <Link
            href={`/app/${
              mediaType === 'tv_show' ? 'tv-shows' : 'movies'
            }/${tmdbId}`}
            className="underline-offset-4 hover:underline"
          >
            {title}
          </Link>

          <ListItemActions listItem={listItem} />
        </div>

        <p className="line-clamp-3 text-xs text-muted-foreground">{overview}</p>
      </div>
    </div>
  )
}
