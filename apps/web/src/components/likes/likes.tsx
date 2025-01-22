'use client'

import { DialogTitle } from '@radix-ui/react-dialog'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from '@plotwist/ui/components/ui/dialog'

import { useGetLikesEntityId } from '@/api/like'
import { useLanguage } from '@/context/language'
import { cn } from '@/lib/utils'
import NumberFlow from '@number-flow/react'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@plotwist/ui/components/ui/avatar'
import { Skeleton } from '@plotwist/ui/components/ui/skeleton'
import { Heart } from 'lucide-react'
import { Link } from 'next-view-transitions'
import { type PropsWithChildren, useState } from 'react'
import { v4 } from 'uuid'
import { ProBadge } from '../pro-badge'

type LikesProps = {
  className?: string
  likeCount: number
  entityId: string
} & PropsWithChildren

export function Likes({
  className,
  likeCount,
  entityId,
  children,
}: LikesProps) {
  const { dictionary, language } = useLanguage()
  const [open, setOpen] = useState(false)
  const { data, isLoading } = useGetLikesEntityId(entityId, {
    query: { enabled: open },
  })

  if (likeCount === 0) return <></>

  const Content = () => {
    if (isLoading || !data) {
      return (
        <>
          {Array.from({ length: 5 }).map(_ => (
            <div key={v4()} className="flex items-center">
              <div className="flex items-center gap-1">
                <Skeleton className="size-10 rounded-full" />
                <Skeleton className="w-[10ch] h-[2ex] ml-2 mr-2 " />
              </div>

              <Skeleton className="w-[5ch] h-[2ex] ml-auto" />
            </div>
          ))}
        </>
      )
    }

    return (
      <>
        {data.likes.map(({ user, id }) => (
          <div key={id} className="flex items-center">
            <Link
              href={`/${language}/${user.username}`}
              className="flex items-center gap-1"
            >
              <Avatar className="size-10 border text-[10px]">
                {user.avatarUrl && (
                  <AvatarImage src={user.avatarUrl} className="object-cover" />
                )}

                <AvatarFallback>
                  {user.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <span className="ml-2 mr-2 truncate text-sm">
                {user.username}
              </span>
            </Link>

            {user.subscriptionType === 'PRO' && <ProBadge />}

            <Link
              href={`/${language}/${user.username}`}
              className="ml-auto whitespace-nowrap pl-8 text-xs text-muted-foreground hover:underline"
            >
              {dictionary.review_likes.view_profile}
            </Link>
          </div>
        ))}
      </>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <div
            className={cn(
              'rounded-md flex items-center bg-background border px-3 py-1 text-xs z-20 gap-1.5 cursor-pointer tabular-nums',
              className
            )}
          >
            <Heart size={12} className="fill-foreground" />
            <NumberFlow value={likeCount} />
          </div>
        )}
      </DialogTrigger>

      <DialogContent className="flex max-h-[642px] flex-col overflow-y-auto">
        <DialogHeader className="mb-2">
          <DialogTitle>{dictionary.likes}</DialogTitle>
        </DialogHeader>

        <Content />
      </DialogContent>
    </Dialog>
  )
}
