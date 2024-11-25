'use client'

import { DialogTitle } from '@radix-ui/react-dialog'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from '@plotwist/ui/components/ui/dialog'

import { useLanguage } from '@/context/language'
import { cn } from '@/lib/utils'
import { useGetLikesEntityId } from '@/api/like'
import { useState } from 'react'
import Link from 'next/link'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@plotwist/ui/components/ui/avatar'
import { tmdbImage } from '@/utils/tmdb/image'
import { ProBadge } from '../pro-badge'
import { Heart } from 'lucide-react'

type LikesProps = {
  className?: string
  likeCount: number
  entityId: string
}

export function Likes({ className, likeCount, entityId }: LikesProps) {
  const { dictionary, language } = useLanguage()
  const [open, setOpen] = useState(false)
  const { data, isLoading } = useGetLikesEntityId(entityId, {
    query: { enabled: open },
  })

  if (likeCount === 0) return <></>

  const Content = () => {
    if (isLoading || !data) {
      return <p>carregando, macho..</p>
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
                {user.imagePath && (
                  <AvatarImage
                    src={tmdbImage(user.imagePath, 'w500')}
                    className="object-cover"
                  />
                )}

                <AvatarFallback>
                  {user.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <span className="ml-2 mr-2 truncate text-sm">
                {user.username}
              </span>
            </Link>

            {user.subscriptionType === 'PRO' && (
              <Link href={`/${language}/pricing`}>
                <ProBadge />
              </Link>
            )}

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
      <DialogTrigger
        className={cn(
          'rounded-md flex items-center bg-background border px-3 py-1 text-xs z-20 gap-0.5',
          className
        )}
      >
        <Heart size={12} /> <span className="ml-1">{likeCount}</span>
      </DialogTrigger>

      <DialogContent className="flex max-h-[642px] flex-col overflow-y-auto">
        <DialogHeader className="mb-2">
          <DialogTitle>{dictionary.review_likes.title}</DialogTitle>
        </DialogHeader>

        <Content />
      </DialogContent>
    </Dialog>
  )
}
