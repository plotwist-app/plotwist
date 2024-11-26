import { MousePointer2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@plotwist/ui/components/ui/avatar'

import { useLanguage } from '@/context/language'
import { cn } from '@/lib/utils'
import { tmdbImage } from '@/utils/tmdb/image'

import { useMediaQuery } from '@/hooks/use-media-query'

import type { GetLists200ListsItem } from '@/api/endpoints.schemas'
import { Skeleton } from '@plotwist/ui/components/ui/skeleton'
import { PopularListCardContextMenu } from './popular-list-card-context-menu'
import { PopularListCardDrawer } from './popular-list-card-drawer'
import { Likes } from '@/components/likes'

type PopularListCardProps = { list: GetLists200ListsItem }

export const PopularListCard = ({ list }: PopularListCardProps) => {
  const { language, dictionary } = useLanguage()
  const [open, setOpen] = useState(false)
  const href = `/${language}/lists/${list.id}`

  const isDesktop = useMediaQuery('(min-width: 1080px)')

  const Trigger = () => {
    return (
      <div className="grid grid-cols-1 gap-2 md:grid-cols-5 md:gap-4">
        <Link
          href={href}
          className="group relative col-span-2 aspect-video overflow-hidden rounded-lg border"
        >
          {list.bannerPath && (
            <Image fill src={tmdbImage(list.bannerPath)} alt="" />
          )}
        </Link>

        <div className="col-span-3 space-y-2">
          <div className="space-y-2">
            <Link href={href} className="text-xl font-bold">
              {list.title}
            </Link>

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Link
                  href={`/${language}/${list.user.username}`}
                  className="flex items-center gap-2"
                >
                  <Avatar className="h-8 w-8 text-xs">
                    {list.user.imagePath && (
                      <AvatarImage
                        src={tmdbImage(list.user.imagePath, 'w500')}
                        className="object-cover"
                      />
                    )}

                    <AvatarFallback>{list.user.username[0]}</AvatarFallback>
                  </Avatar>

                  <span className="text-sm text-muted-foreground">
                    {list.user.username}
                  </span>
                </Link>
              </div>
            </div>

            <p className="line-clamp-3 text-sm text-muted-foreground">
              {list.description}
            </p>

            {list.likeCount > 0 && (
              <div className="flex">
                <Likes entityId={list.id} likeCount={list.likeCount} />
              </div>
            )}
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
