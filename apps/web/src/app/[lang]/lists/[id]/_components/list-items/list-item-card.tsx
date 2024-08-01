'use client'

import { ComponentProps, useState } from 'react'
import Image from 'next/image'

import { ListItemActions } from './list-item-actions'

import { cn } from '@/lib/utils'
import { CSS } from '@dnd-kit/utilities'
import { tmdbImage } from '@/utils/tmdb/image'

import { ListItem } from '@/types/supabase/lists'
import { useSortable } from '@dnd-kit/sortable'

type ListItemCardProps = {
  listItem: ListItem
  showOverlay: boolean
  isEditable: boolean
} & ComponentProps<'div'>

export const ListItemCard = ({
  listItem,
  showOverlay,
  isEditable,
}: ListItemCardProps) => {
  const { poster_path: poster, title } = listItem
  const [openDropdown, setOpenDropdown] = useState(false)
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: listItem.id })

  const isHighlighted = openDropdown || showOverlay

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      className={
        isEditable
          ? 'group cursor-grab space-y-2'
          : 'group cursor-pointer space-y-2'
      }
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
    >
      <div className="relative aspect-poster w-full overflow-hidden rounded-md border bg-background/50 shadow">
        {poster && (
          <Image
            fill
            className="z-10 object-fill"
            src={tmdbImage(poster, 'w500')}
            alt={title}
            sizes="100%"
          />
        )}

        <div
          className={cn(
            'absolute z-20 h-full w-full bg-gradient-to-b from-black to-black/50 opacity-0 transition-all group-hover:opacity-100',
            isHighlighted && 'opacity-100',
          )}
        />

        <div
          className={cn(
            'absolute right-2 top-2 z-30 flex scale-0 gap-1 transition-all group-hover:scale-100',
            isHighlighted && 'scale-100',
          )}
        >
          {!isEditable && (
            <ListItemActions
              listItem={listItem}
              openDropdown={openDropdown}
              setOpenDropdown={setOpenDropdown}
            />
          )}
        </div>
      </div>
    </div>
  )
}
