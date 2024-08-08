'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'

import { useLanguage } from '@/context/language'
import { useAuth } from '@/context/auth'

import { Drawer, DrawerContent, DrawerTrigger } from '../ui/drawer'
import { Button } from '../ui/button'
import { Accordion } from '../ui/accordion'
import { buildLanguageNavigation } from './header-navigation-data'
import { HeaderNavigationDrawerItem } from './header-navigation-drawer-item'
import { CommandSearch } from '../command-search'
import { SettingsDropdown } from '../settings-dropdown'
import Link from 'next/link'

export const HeaderNavigationDrawer = () => {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { dictionary, language } = useLanguage()

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
          {user ? (
            <div>
              <h1>{user.username}</h1>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Button size="default" variant="outline" asChild>
                <Link href={`/${language}/sign-up`}>Sign up</Link>
              </Button>

              <Button size="default">Log in</Button>
            </div>
          )}

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
