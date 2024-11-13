'use client'

import { MediaType } from '@/types/supabase/media-type'
import { Button } from '@plotwist/ui/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from '@plotwist/ui/components/ui/drawer'

import { ItemDrawerActions } from './item-drawer-actions'
import { MoreHorizontal } from 'lucide-react'
import { useMediaQuery } from '@/hooks/use-media-query'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@plotwist/ui/components/ui/dialog'

export type ItemDrawerProps = {
  mediaType: MediaType
  tmdbId: number
  title?: string
}

export function ItemDrawer({ mediaType, tmdbId, title }: ItemDrawerProps) {
  const isDesktop = useMediaQuery('(min-width: 1080px)')

  if (isDesktop) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button
            size="icon"
            className="absolute size-8 top-4 right-4 bg-background"
            variant="outline"
          >
            <MoreHorizontal />
          </Button>
        </DialogTrigger>

        <DialogContent className="w-[480px] p-0 gap-0">
          <DialogTitle className="p-4">{title}</DialogTitle>
          <ItemDrawerActions mediaType={mediaType} tmdbId={tmdbId} />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          size="icon"
          className="absolute top-4 right-4 bg-background"
          variant="outline"
        >
          <MoreHorizontal />
        </Button>
      </DrawerTrigger>

      <DrawerContent className="space-y-4">
        <ItemDrawerActions mediaType={mediaType} tmdbId={tmdbId} />
      </DrawerContent>
    </Drawer>
  )
}
