'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import {
  Accordion,
  Drawer,
  DrawerContent,
  DrawerTrigger,
  Button,
} from '@plotwist/ui'

import { Menu } from 'lucide-react'

import { useLanguage } from '@/context/language'

import { buildLanguageNavigation } from './header-navigation-data'
import { HeaderNavigationDrawerItem } from './header-navigation-drawer-item'
import { CommandSearch } from '../command-search'
import { SettingsDropdown } from '../settings-dropdown'

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

          <div className="flex gap-2">
            <CommandSearch />
            <SettingsDropdown />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
