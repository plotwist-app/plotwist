import Image from 'next/image'
import Link from 'next/link'

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@plotwist/ui/components/ui/avatar'

import { useLanguage } from '@/context/language'

import type { GetLists200ListsItem } from '@/api/endpoints.schemas'
import { Likes } from '@/components/likes'
import { Skeleton } from '@plotwist/ui/components/ui/skeleton'

type PopularListCardProps = { list: GetLists200ListsItem }

export const PopularListCard = ({ list }: PopularListCardProps) => {
  const { language } = useLanguage()
  const href = `/${language}/lists/${list.id}`

  return (
    <div className="grid grid-cols-1 gap-2 md:grid-cols-5 md:gap-4">
      <Link
        href={href}
        className="group relative col-span-2 aspect-video overflow-hidden rounded-lg border"
      >
        {list.bannerUrl && (
          <Image fill src={list.bannerUrl} alt="" className="object-cover" />
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
                  {list.user.avatarUrl && (
                    <AvatarImage
                      src={list.user.avatarUrl}
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
