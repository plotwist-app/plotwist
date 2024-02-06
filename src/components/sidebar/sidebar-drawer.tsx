'use client'

import { Menu } from 'lucide-react'
import { Button } from '../ui/button'
import { Drawer, DrawerContent, DrawerTrigger } from '../ui/drawer'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

type SidebarDrawerProps = { children: JSX.Element }

export const SidebarDrawer = ({ children }: SidebarDrawerProps) => {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button size="icon" variant="outline">
          <Menu />
        </Button>
      </DrawerTrigger>

      <DrawerContent>
        <div className="flex flex-col gap-4 p-4">{children}</div>
      </DrawerContent>
    </Drawer>
  )
}
