'use client'

import Link from 'next/link'
import { PropsWithChildren } from 'react'

import {
  Copy,
  ExternalLink,
  Heart,
  HeartOff,
  Instagram,
  Share,
  Twitter,
} from 'lucide-react'

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { ProBadge } from '@/components/pro-badge'
import { APP_URL } from '../../../../../constants'
import { toast } from 'sonner'
import { useList } from '@/hooks/use-list'
import { PopularList } from '@/types/supabase/lists'
import { useAuth } from '@/context/auth'

type PopularListCardContextMenuProps = {
  href: string
  list: PopularList
} & PropsWithChildren

export const PopularListCardContextMenu = ({
  children,
  href,
  list,
}: PopularListCardContextMenuProps) => {
  const { handleLike, handleRemoveLike } = useList()
  const { user } = useAuth()

  const userLike = list.list_likes.find((like) => like.user_id === user?.id)

  console.log({ list })

  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>

      <ContextMenuContent>
        <ContextMenuItem asChild>
          <Link href={href}>
            <ExternalLink className="mr-2 size-4" />
            Visit
          </Link>
        </ContextMenuItem>

        {userLike ? (
          <ContextMenuItem onClick={() => handleRemoveLike.mutate(userLike.id)}>
            <HeartOff className="mr-2 size-4" />
            Remove like
          </ContextMenuItem>
        ) : (
          <ContextMenuItem
            onClick={() =>
              handleLike.mutate({
                listId: list.id,
                userId: list.user_id,
              })
            }
            disabled={!user}
          >
            <Heart className="mr-2 size-4" />
            Like
          </ContextMenuItem>
        )}

        <ContextMenuItem disabled>
          <Copy className="mr-2 size-4" />
          Clone
          <ProBadge className="ml-2" />
        </ContextMenuItem>

        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Share className="mr-2 size-4" />
            Share
          </ContextMenuSubTrigger>

          <ContextMenuSubContent className="w-56">
            <ContextMenuItem
              onClick={() => {
                navigator.clipboard.writeText(`${APP_URL}${href}`)

                toast.success('List link copied to clipboard.')
              }}
            >
              <Copy className="mr-2 size-4" />
              Copy link
            </ContextMenuItem>

            <ContextMenuItem disabled className="flex justify-between">
              <div className="flex">
                <Twitter className="mr-2 size-4" />
                Share to Twitter
              </div>

              <ProBadge className="ml-2" />
            </ContextMenuItem>

            <ContextMenuItem disabled className="flex justify-between">
              <div className="flex">
                <Instagram className="mr-2 size-4" />
                Share to Instagram
              </div>

              <ProBadge className="ml-2" />
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
      </ContextMenuContent>
    </ContextMenu>
  )
}
