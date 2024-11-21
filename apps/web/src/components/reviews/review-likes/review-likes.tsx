'use client'

import { DialogTitle } from '@radix-ui/react-dialog'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from '@plotwist/ui/components/ui/dialog'
import { Skeleton } from '@plotwist/ui/components/ui/skeleton'

import { useLanguage } from '@/context/language'

import { cn } from '@/lib/utils'
import { v4 } from 'uuid'

type ReviewLikes = {
  reviewId: string
  className?: string
}

export function ReviewLikes({ reviewId, className }: ReviewLikes) {
  const { dictionary } = useLanguage()

  const likes = {
    count: 0,
    data: {},
    reviewId,
  }

  if (!likes) {
    return (
      <div
        className={cn(
          'absolute -bottom-3 right-2 h-6 w-11 animate-pulse rounded-full border bg-muted z-20',
          className
        )}
      />
    )
  }

  if (likes.count === 0) return null

  return (
    <Dialog>
      <DialogTrigger
        className={cn(
          'absolute -bottom-3.5 right-2 rounded-full border bg-muted px-3 py-1 text-xs hover:bg-muted/60 z-20',
          className
        )}
      >
        ❤ <span className="ml-1">{likes.count}</span>
      </DialogTrigger>

      <DialogContent className="flex max-h-[642px] flex-col overflow-y-auto">
        <DialogHeader className="mb-2">
          <DialogTitle>{dictionary.review_likes.title}</DialogTitle>
        </DialogHeader>

        {!likes.data &&
          Array.from({ length: 5 }).map((_, index) => (
            <div key={v4()} className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-full" />
              <Skeleton className="h-5 w-40" />
              <Skeleton className="ml-auto h-4 w-20" />
            </div>
          ))}

        {/* {likes.data?.map((likeInfo) => (
          <div key={likeInfo.profiles?.id} className="flex items-center">
            <Link
              href={`/${language}/${likeInfo.profiles?.username}`}
              className="flex items-center gap-1"
            >
              <Avatar className="size-10 border text-[10px] shadow">
                {likeInfo.profiles?.image_path && (
                  <AvatarImage
                    src={tmdbImage(likeInfo.profiles?.image_path, 'w500')}
                    className="object-cover"
                  />
                )}

                <AvatarFallback>
                  {likeInfo.profiles?.username?.at(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <span className="ml-2 mr-2 truncate text-sm">
                {likeInfo.profiles?.username}
              </span>
            </Link>

            {likeInfo.profiles?.subscription_type === 'PRO' && (
              <Link href={`/${language}/pricing`}>
                <ProBadge />
              </Link>
            )}

            <Link
              href={`/${language}/${likeInfo.profiles?.username}`}
              className="ml-auto whitespace-nowrap pl-8 text-xs text-muted-foreground hover:underline"
            >
              {dictionary.review_likes.view_profile}
            </Link>
          </div>
        ))} */}
      </DialogContent>
    </Dialog>
  )
}
