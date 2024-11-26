'use client'

import Link from 'next/link'
import type { PropsWithChildren } from 'react'
import { toast } from 'sonner'

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
} from '@plotwist/ui/components/ui/context-menu'

import { APP_URL } from '../../../../../constants'

import { useLanguage } from '@/context/language'

import type { GetLists200ListsItem } from '@/api/endpoints.schemas'

type PopularListCardContextMenuProps = {
  href: string
  list: GetLists200ListsItem
} & PropsWithChildren

export const PopularListCardContextMenu = ({
  children,
  href,
  list,
}: PopularListCardContextMenuProps) => {
  const { dictionary } = useLanguage()

  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>

      <ContextMenuContent>
        <ContextMenuItem asChild>
          <Link href={href}>
            <ExternalLink className="mr-2 size-4" />
            {dictionary.visit}
          </Link>
        </ContextMenuItem>

        {list.hasLiked ? (
          <ContextMenuItem onClick={() => console.log(list.id)}>
            <HeartOff className="mr-2 size-4" />
            {dictionary.remove_like}
          </ContextMenuItem>
        ) : (
          <ContextMenuItem onClick={() => {}} disabled={true}>
            <Heart className="mr-2 size-4" />
            {dictionary.like}
          </ContextMenuItem>
        )}

        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Share className="mr-2 size-4" />
            {dictionary.share}
          </ContextMenuSubTrigger>

          <ContextMenuSubContent className="w-72">
            <ContextMenuItem
              onClick={() => {
                navigator.clipboard.writeText(`${APP_URL}${href}`)

                toast.success(dictionary.link_copied_to_clipboard)
              }}
            >
              <Copy className="mr-2 size-4" />
              {dictionary.copy_link}
            </ContextMenuItem>

            <ContextMenuItem disabled className="flex justify-between">
              <div className="flex">
                <Twitter className="mr-2 size-4" />
                {dictionary.share_to_twitter}
              </div>
            </ContextMenuItem>

            <ContextMenuItem disabled className="flex justify-between">
              <div className="flex">
                <Instagram className="mr-2 size-4" />
                {dictionary.share_to_instagram}
              </div>
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
      </ContextMenuContent>
    </ContextMenu>
  )
}
