'use client'

import { Button } from '@plotwist/ui/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from '@plotwist/ui/components/ui/drawer'

import { Eye, List, MoreVertical, Plus } from 'lucide-react'
import { tv } from 'tailwind-variants'

const classNames = {
  action: tv({
    base: 'flex flex-col items-center justify-center gap-2 rounded-sm p-4 hover:bg-muted [&_p]:text-sm [&_p]:text-muted-foreground cursor-pointer',
    variants: {
      checked: {
        true: 'bg-muted',
      },
    },
  }),
}

export const MovieActions = () => {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          className="absolute right-4 top-4 z-50 bg-background"
          size="icon"
          variant="outline"
        >
          <MoreVertical size="20px" />
        </Button>
      </DrawerTrigger>

      <DrawerContent className="">
        <div className="grid grid-cols-3 gap-2 p-4">
          <button
            className={classNames.action({ checked: true })}
            onClick={() => alert('oi')}
          >
            <Eye className="size-6" />
            <p>Watched</p>
          </button>

          <button className={classNames.action({ checked: true })}>
            <List className="size-6" />
            <p>Watchlist</p>
          </button>

          <button className={classNames.action({})}>
            <Plus className="size-6" />
            <p>Add to list</p>
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
