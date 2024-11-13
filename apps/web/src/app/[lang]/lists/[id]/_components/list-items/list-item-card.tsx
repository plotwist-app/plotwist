'use client'

import { ComponentProps, useState } from 'react'
import Image from 'next/image'

import { ListItemActions } from './list-item-actions'

import { cn } from '@/lib/utils'
import { tmdbImage } from '@/utils/tmdb/image'

import { ListItem } from '@/types/supabase/lists'

type ListItemCardProps = {
  listItem: ListItem
} & ComponentProps<'div'>

export const ListItemCard = ({ listItem }: ListItemCardProps) => {
  const { posterPath, title } = listItem
  const [openDropdown, setOpenDropdown] = useState(false)

  return (
    <div className="group cursor-pointer space-y-2">
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
            'absolute z-20 h-full w-full bg-gradient-to-b from-black to-black/50 opacity-0 transition-all group-hover:opacity-100',
          )}
        />

        <div
          className={cn(
            'absolute right-2 top-2 z-30 flex scale-0 gap-1 transition-all group-hover:scale-100',
          )}
        >
          <ListItemActions
            listItem={listItem}
            openDropdown={openDropdown}
            setOpenDropdown={setOpenDropdown}
          />
        </div>
      </div>
    </div>
  )
}
