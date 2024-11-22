import type { GetLists200ListsItem } from '@/api/endpoints.schemas'
import { ProBadge } from '@/components/pro-badge'
import { useLanguage } from '@/context/language'
import { useSession } from '@/context/session'
import { cn } from '@/lib/utils'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@plotwist/ui/components/ui/accordion'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  type DrawerProps,
  DrawerTitle,
  DrawerTrigger,
} from '@plotwist/ui/components/ui/drawer'
import {
  Copy,
  ExternalLink,
  Heart,
  HeartOff,
  Instagram,
  Share,
  Twitter,
} from 'lucide-react'
import type { PropsWithChildren } from 'react'
import { toast } from 'sonner'
import { APP_URL } from '../../../../../constants'
import Link from 'next/link'

type PopularListCardDrawerProps = PropsWithChildren &
  DrawerProps & {
    list: GetLists200ListsItem
    href: string
  }

export const PopularListCardDrawer = ({
  list,
  href,
  children,
  ...drawerProps
}: PopularListCardDrawerProps) => {
  const { user } = useSession()
  const { dictionary } = useLanguage()

  return (
    <Drawer {...drawerProps}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>

      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{list.title}</DrawerTitle>
          <DrawerDescription>{list.description}</DrawerDescription>
        </DrawerHeader>

        <div className="space-y-1 p-4">
          <Link
            className="flex cursor-pointer items-center rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground"
            href={href}
          >
            <ExternalLink className="mr-2 size-4" />
            {dictionary.visit}
          </Link>

          {/* 
          {list.hasLiked ? (
            <div className="flex cursor-pointer items-center rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground">
              <HeartOff className="mr-2 size-4" />
              {dictionary.remove_like}
            </div>
          ) : (
            <div
              className={cn(
                'flex cursor-pointer items-center rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground',
                !user && 'pointer-events-none opacity-50'
              )}
            >
              <Heart className="mr-2 size-4" />
              {dictionary.like}
            </div>
          )} */}

          <Accordion type="multiple">
            <AccordionItem value="share" className="border-none">
              <AccordionTrigger className="p-0">
                <div className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground">
                  <Share className="mr-2 size-4" />
                  {dictionary.share}
                </div>
              </AccordionTrigger>

              <AccordionContent className="space-y-1 pl-6">
                <div
                  className="flex cursor-pointer items-center rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground"
                  onClick={() => {
                    navigator.clipboard.writeText(`${APP_URL}${href}`)
                    toast.success(dictionary.link_copied_to_clipboard)
                  }}
                  onKeyDown={() => {
                    navigator.clipboard.writeText(`${APP_URL}${href}`)
                    toast.success(dictionary.link_copied_to_clipboard)
                  }}
                >
                  <Copy className="mr-2 size-4" />
                  {dictionary.copy_link}
                </div>

                <div className="flex cursor-pointer items-center rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground opacity-50">
                  <div className="flex">
                    <Twitter className="mr-2 size-4" />
                    {dictionary.share_to_twitter}
                  </div>

                  <ProBadge className="ml-2" />
                </div>

                <div className="flex cursor-pointer items-center rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground opacity-50">
                  <div className="flex">
                    <Instagram className="mr-2 size-4" />
                    {dictionary.share_to_instagram}
                  </div>

                  <ProBadge className="ml-2" />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
