import { MousePointer2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'

import { useLanguage } from '@/context/language'
import { cn } from '@/lib/utils'
import { PopularList } from '@/types/supabase/lists'
import { tmdbImage } from '@/utils/tmdb/image'

import { useMediaQuery } from '@/hooks/use-media-query'

import { PopularListCardContextMenu } from './popular-list-card-context-menu'
import { PopularListCardDrawer } from './popular-list-card-drawer'
import { Skeleton } from '@/components/ui/skeleton'

type PopularListCardProps = { list: PopularList }

export const PopularListCard = ({ list }: PopularListCardProps) => {
  const { language, dictionary } = useLanguage()
  const [open, setOpen] = useState(false)
  const href = `/${language}/lists/${list.id}`

  const isDesktop = useMediaQuery('(min-width: 1080px)')

  const Trigger = () => {
    return (
      <div className="grid grid-cols-1 gap-2 md:grid-cols-5 md:gap-4">
        <div className="group relative col-span-2 aspect-video overflow-hidden rounded-lg border bg-muted shadow">
          <div
            className={cn(
              'absolute z-50 flex h-full w-full items-center justify-center bg-black/0 text-white transition group-hover:bg-black/75',
              open && 'bg-black/75',
            )}
            onClick={() => setOpen(true)}
          >
            <span
              className={cn(
                'hidden items-center text-sm opacity-0 transition-all group-hover:opacity-100 md:flex',
                open && 'opacity-100',
              )}
            >
              <MousePointer2 className="mr-2 size-4" />
              {dictionary.right_click_here}
            </span>
          </div>

          {list.cover_path && (
            <Image
              fill
              src={tmdbImage(list.cover_path)}
              alt=""
              className="transition-all hover:scale-105"
            />
          )}
        </div>

        <div className="col-span-3 space-y-2">
          <div className="space-y-2">
            <Link href={href} className="text-xl font-bold">
              {list.name}
            </Link>

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Link
                  href={`/${language}/${list.profiles.username}`}
                  className="flex items-center gap-2"
                >
                  <Avatar className="h-8 w-8 text-xs">
                    {list.profiles.image_path && (
                      <AvatarImage
                        src={tmdbImage(list.profiles.image_path, 'w500')}
                        className="object-cover"
                      />
                    )}

                    <AvatarFallback>{list.profiles.username[0]}</AvatarFallback>
                  </Avatar>

                  <span className="text-sm text-muted-foreground">
                    {list.profiles.username}
                  </span>
                </Link>

                <Separator className="h-4" orientation="vertical" />

                <div className="cursor-pointer rounded-full border px-2 py-0.5 text-xs text-muted-foreground transition-all hover:bg-muted">
                  ❤ <span className="ml-1">{list.list_likes.length}</span>
                </div>
              </div>
            </div>

            <p className="line-clamp-3 text-sm text-muted-foreground">
              {list.description}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (isDesktop) {
    return (
      <PopularListCardContextMenu href={href} list={list}>
        <Trigger />
      </PopularListCardContextMenu>
    )
  }

  return (
    <PopularListCardDrawer
      open={open}
      onOpenChange={setOpen}
      list={list}
      href={href}
    >
      <Trigger />
    </PopularListCardDrawer>
  )
}

export const PopularListCardSkeleton = () => {
  return (
    <div className="grid grid-cols-1 gap-2 md:grid-cols-5 md:gap-4">
      <Skeleton className="col-span-2 aspect-video overflow-hidden rounded-lg border shadow" />

      <div className="col-span-3 space-y-2">
        <div className="space-y-2">
          <Skeleton className="h-[3ex] w-[20ch]" />

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />

                <Skeleton className="h-[1.5ex] w-[10ch]" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Skeleton className="h-[1.5ex] w-full" />
            <Skeleton className="h-[1.5ex] w-1/3" />
          </div>
        </div>
      </div>
    </div>
  )
}
