import { ProBadge } from '@/components/pro-badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { useLanguage } from '@/context/language'
import { cn } from '@/lib/utils'
import { PopularList } from '@/types/supabase/lists'
import { tmdbImage } from '@/utils/tmdb/image'
import {
  Copy,
  ExternalLink,
  Heart,
  Instagram,
  MousePointer2,
  Share,
  Twitter,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'

type PopularListCardProps = { list: PopularList }
export const PopularListCard = ({ list }: PopularListCardProps) => {
  const { language } = useLanguage()
  const [contextOpen, setContextOpen] = useState(false)

  const href = `/${language}/lists/${list.id}`

  return (
    <ContextMenu onOpenChange={setContextOpen} modal={false}>
      <ContextMenuTrigger>
        <div className="grid grid-cols-5 gap-4">
          <div className="group relative col-span-2 aspect-video overflow-hidden rounded-lg border bg-muted shadow">
            <div
              className={cn(
                'absolute z-50 flex h-full w-full items-center justify-center bg-black/0 text-white transition group-hover:bg-black/75',
                contextOpen && 'bg-black/75',
              )}
              onClick={() => setContextOpen(true)}
            >
              <span
                className={cn(
                  'flex items-center text-sm opacity-0 transition-all group-hover:opacity-100',
                  contextOpen && 'opacity-100',
                )}
              >
                <MousePointer2 className="mr-2 size-4" />
                Right click here
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

                {/* <div className="rounded-full border bg-muted px-3 py-1 text-xs">
                  <div>
                    ❤ <span className="ml-1">0</span>
                  </div>
                </div> */}
              </div>

              <p className="line-clamp-3 text-sm text-muted-foreground">
                {list.description}
              </p>
            </div>
          </div>
        </div>
      </ContextMenuTrigger>

      <ContextMenuContent>
        <ContextMenuItem asChild>
          <Link href={href}>
            <ExternalLink className="mr-2 size-4" />
            Visit
          </Link>
        </ContextMenuItem>

        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Share className="mr-2 size-4" />
            Share
          </ContextMenuSubTrigger>

          <ContextMenuSubContent className="w-56">
            <ContextMenuItem
              onClick={() => toast.success('Link copied to clipboard.')}
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

        <ContextMenuItem disabled>
          <Heart className="mr-2 size-4" />
          Like
        </ContextMenuItem>

        <ContextMenuItem disabled>
          <Copy className="mr-2 size-4" />
          Clone
          <ProBadge className="ml-2" />
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
