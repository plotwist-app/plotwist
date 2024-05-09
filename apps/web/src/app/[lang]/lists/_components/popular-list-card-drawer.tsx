import { ProBadge } from '@/components/pro-badge'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerProps,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { PopularList } from '@/types/supabase/lists'
import {
  ChevronDown,
  Copy,
  ExternalLink,
  Heart,
  Instagram,
  Share,
  Twitter,
} from 'lucide-react'
import { PropsWithChildren } from 'react'

type PopularListCardDrawerProps = PropsWithChildren &
  DrawerProps & {
    list: PopularList
  }

export const PopularListCardDrawer = ({
  list,
  children,
  ...drawerProps
}: PopularListCardDrawerProps) => {
  return (
    <Drawer {...drawerProps}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>

      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{list.name}</DrawerTitle>
          <DrawerDescription>{list.description}</DrawerDescription>
        </DrawerHeader>

        <div className="space-y-1 p-4">
          <div className="flex cursor-pointer items-center rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground">
            <ExternalLink className="mr-2 size-4" />
            Visit
          </div>

          <div className="flex cursor-pointer items-center rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground">
            <Heart className="mr-2 size-4" />
            Like
          </div>

          <div className="flex cursor-not-allowed items-center rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground opacity-50">
            <Copy className="mr-2 size-4" />
            Clone
            <ProBadge className="ml-2" />
          </div>

          <Accordion type="multiple">
            <AccordionItem value="share" className="border-none">
              <AccordionTrigger className="p-0">
                <div className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground">
                  <Share className="mr-2 size-4" />
                  Share
                </div>
              </AccordionTrigger>

              <AccordionContent className="space-y-1 pl-6">
                <div className="flex cursor-pointer items-center rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground">
                  <Copy className="mr-2 size-4" />
                  Copy link
                </div>

                <div className="flex cursor-pointer items-center rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground opacity-50">
                  <div className="flex">
                    <Twitter className="mr-2 size-4" />
                    Share to Twitter
                  </div>

                  <ProBadge className="ml-2" />
                </div>

                <div className="flex cursor-pointer items-center rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground opacity-50">
                  <div className="flex">
                    <Instagram className="mr-2 size-4" />
                    Share to Instagram
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
