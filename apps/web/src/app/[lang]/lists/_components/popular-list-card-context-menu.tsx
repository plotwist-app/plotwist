import Link from 'next/link'
import { PropsWithChildren } from 'react'

import {
  Copy,
  ExternalLink,
  Heart,
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

type PopularListCardContextMenuProps = { href: string } & PropsWithChildren

export const PopularListCardContextMenu = ({
  children,
  href,
}: PopularListCardContextMenuProps) => {
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

        <ContextMenuItem disabled>
          <Heart className="mr-2 size-4" />
          Like
        </ContextMenuItem>

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
