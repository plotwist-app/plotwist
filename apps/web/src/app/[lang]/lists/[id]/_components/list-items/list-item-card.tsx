'use client'

import Image from 'next/image'
import type { ComponentProps } from 'react'

import { ListItemActions } from './list-item-actions'

import { cn } from '@/lib/utils'
import { tmdbImage } from '@/utils/tmdb/image'

import { useLanguage } from '@/context/language'
import Link from 'next/link'

import type { GetListItemsByListId200Item } from '@/api/endpoints.schemas'

export type ListItemCardProps = {
  listItem: GetListItemsByListId200Item
} & ComponentProps<'div'>

export const ListItemCard = ({ listItem }: ListItemCardProps) => {
  const { posterPath, title, mediaType, tmdbId } = listItem
  const { language } = useLanguage()

  const href = `/${language}/${mediaType === 'MOVIE' ? 'movies' : 'tv-series'}/${tmdbId}`

  return (
    <Link href={href} className="group cursor-pointer space-y-2">
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
