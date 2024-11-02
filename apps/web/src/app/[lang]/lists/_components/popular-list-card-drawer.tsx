import { ProBadge } from '@/components/pro-badge'
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
  DrawerTitle,
  DrawerTrigger,
  DrawerProps,
} from '@plotwist/ui/components/ui/drawer'
import { useList } from '@/hooks/use-list'
import { cn } from '@/lib/utils'
import {
  Copy,
  ExternalLink,
  Heart,
  HeartOff,
  Instagram,
  Share,
  Twitter,
} from 'lucide-react'
import { PropsWithChildren } from 'react'
import { toast } from 'sonner'
import { APP_URL } from '../../../../../constants'
import { useLanguage } from '@/context/language'
import { useSession } from '@/context/session'
import { GetLists200ListsItem } from '@/api/endpoints.schemas'

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
  const { handleLike, handleRemoveLike, handleCloneList } = useList()
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
          <div className="flex cursor-pointer items-center rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground">
            <ExternalLink className="mr-2 size-4" />
            {dictionary.visit}
          </div>

          {list.hasLiked ? (
            <div
              className="flex cursor-pointer items-center rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground"
              onClick={() => handleRemoveLike.mutate(list.id)}
            >
              <HeartOff className="mr-2 size-4" />
              {dictionary.remove_like}
            </div>
          ) : (
            <div
              className={cn(
                'flex cursor-pointer items-center rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground',
                !user && 'pointer-events-none opacity-50',
              )}
              onClick={() => {
                if (user) {
                  handleLike.mutate({
                    listId: list.id,
                    userId: user.id,
                  })
                }
              }}
            >
              <Heart className="mr-2 size-4" />
              {dictionary.like}
            </div>
          )}

          <div
            className="flex cursor-pointer items-center rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground"
            onClick={() => {
              if (user) {
                handleCloneList.mutate({
                  listId: list.id,
                  userId: user.id,
                })
              }
            }}
          >
            <Copy className="mr-2 size-4" />
            {dictionary.clone}
            <ProBadge className="ml-2" />
          </div>

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
