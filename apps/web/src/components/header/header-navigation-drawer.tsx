'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'

import { useLanguage } from '@/context/language'
import { useAuth } from '@/context/auth'

import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from '@plotwist/ui/components/ui/drawer'
import { Button } from '@plotwist/ui/components/ui/button'
import { Accordion } from '@plotwist/ui/components/ui/accordion'

import { buildLanguageNavigation } from './header-navigation-data'
import { HeaderNavigationDrawerItem } from './header-navigation-drawer-item'
import { HeaderNavigationDrawerUser } from './header-navigation-drawer-user'

import { CommandSearch } from '../command-search'
import { HeaderNavigationDrawerConfigs } from './header-navigation-drawer-configs'

export const HeaderNavigationDrawer = () => {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { language, dictionary } = useLanguage()

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
          <div>
            {user ? (
              <HeaderNavigationDrawerUser user={user} />
            ) : (
              <div className="mb-2 grid grid-cols-2 gap-2 px-2">
                <Button size="default" variant="outline" asChild>
                  <Link href={`/${language}/sign-up`}>
                    {dictionary.sign_up}
                  </Link>
                </Button>

                <Button size="default" asChild>
                  <Link href={`/${language}/login`}>{dictionary.login}</Link>
                </Button>
              </div>
            )}

            <HeaderNavigationDrawerConfigs />
          </div>

          <div className="space-y-4 border-t pt-4">
            <Accordion type="multiple">
              <nav className="flex flex-col space-y-2">
                {buildLanguageNavigation(dictionary).map((item) => {
                  return (
                    <HeaderNavigationDrawerItem {...item} key={item.href} />
                  )
                })}
              </nav>
            </Accordion>

            <CommandSearch />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
