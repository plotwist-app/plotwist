'use client'

import type { GetListItemsByListId200Item } from '@/api/endpoints.schemas'
import { useLanguage } from '@/context/language'
import { cn } from '@/lib/utils'
import { tmdbImage } from '@/utils/tmdb/image'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Link } from 'next-view-transitions'
import Image from 'next/image'
import { ListItemActions } from './list-item-actions'

export type ListItemCardProps = {
  listItem: GetListItemsByListId200Item
  isEditingOrder: boolean
}

export const ListItemCard = ({
  listItem,
  isEditingOrder,
  ...props
}: ListItemCardProps) => {
  const { posterPath, title, mediaType, tmdbId } = listItem
  const { language } = useLanguage()
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: listItem.id })

  const href = `/${language}/${mediaType === 'MOVIE' ? 'movies' : 'tv-series'}/${tmdbId}`

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  if (isEditingOrder) {
    return (
      <div
        className={cn('group cspace-y-2 cursor-grab')}
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        style={style}
        {...props}
      >
        <div className="relative aspect-poster w-full overflow-hidden rounded-md border bg-background/50 shadow">
          {posterPath && (
            <Image
              fill
              className="z-10 object-fill"
              src={tmdbImage(posterPath, 'w500')}
              alt={title}
              sizes="100%"
            />
          )}
        </div>
      </div>
    )
  }

  return (
    <Link
      href={href}
      className={cn('group cursor-pointer space-y-2')}
      style={style}
      {...props}
    >
      <div className="relative aspect-poster w-full overflow-hidden rounded-md border bg-background/50 shadow">
        {posterPath && (
          <Image
            fill
            className="z-10 object-fill"
            src={tmdbImage(posterPath, 'w500')}
            alt={title}
            sizes="100%"
          />
        )}

        <div
          className={cn(
            'absolute right-2 top-2 z-30 flex scale-0 gap-1 transition-all group-hover:scale-100'
          )}
        >
          <ListItemActions listItem={listItem} />
        </div>
      </div>
    </Link>
  )
}
