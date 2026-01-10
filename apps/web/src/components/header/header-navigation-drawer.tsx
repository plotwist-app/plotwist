'use client'

import { Accordion } from '@plotwist/ui/components/ui/accordion'
import { Button } from '@plotwist/ui/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from '@plotwist/ui/components/ui/drawer'
import { Menu } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { Link } from 'next-view-transitions'
import { useEffect, useState } from 'react'
import { useLanguage } from '@/context/language'
import { useSession } from '@/context/session'
import { buildLanguageNavigation } from './header-navigation-data'
import { HeaderNavigationDrawerConfigs } from './header-navigation-drawer-configs'
import { HeaderNavigationDrawerItem } from './header-navigation-drawer-item'
import { HeaderNavigationDrawerUser } from './header-navigation-drawer-user'

export const HeaderNavigationDrawer = () => {
  const { user } = useSession()
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { language, dictionary } = useLanguage()

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
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
        <DrawerTitle />
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
                  <Link href={`/${language}/sign-in`}>{dictionary.login}</Link>
                </Button>
              </div>
            )}

            <HeaderNavigationDrawerConfigs />
          </div>

          <div className="space-y-4 border-t pt-4">
            <Accordion type="multiple">
              <nav className="flex flex-col space-y-2">
                {buildLanguageNavigation(dictionary).map(item => {
                  return (
                    <HeaderNavigationDrawerItem {...item} key={item.href} />
                  )
                })}
              </nav>
            </Accordion>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
