'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Drawer, DrawerContent, DrawerTrigger } from '../ui/drawer'
import { Button } from '../ui/button'
import { Menu } from 'lucide-react'
import { Accordion } from '../ui/accordion'
import { buildLanguageNavigation } from './header-navigation-data'
import { useLanguage } from '@/context/language'
import { HeaderNavigationDrawerItem } from './header-navigation-drawer-item'
import { CommandSearch } from '../command-search'

export const HeaderNavigationDrawer = () => {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { dictionary } = useLanguage()

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
        <div className="flex flex-col gap-4 p-4">
          <div className="space-y-4">
            <Accordion type="multiple">
              <nav className="flex flex-col space-y-2">
                {buildLanguageNavigation(dictionary).map((item) => {
                  return (
                    <HeaderNavigationDrawerItem {...item} key={item.href} />
                  )
                })}
              </nav>
            </Accordion>
          </div>

          <CommandSearch />
        </div>
      </DrawerContent>
    </Drawer>
  )
}
