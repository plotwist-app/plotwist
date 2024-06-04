'use client'

import { CommandSearch } from '../command-search'
import { SettingsDropdown } from '../settings-dropdown'
import { HeaderNavigationMenu } from './header-navigation-menu'
import { HeaderNavigationDrawer } from './header-navigation-drawer'
import { Logo } from '../logo'
import { useAuth } from '@/context/auth'
import Link from 'next/link'
import { useLanguage } from '@/context/language'
import { User } from 'lucide-react'

export const Header = () => {
  const { user } = useAuth()
  const { language, dictionary } = useLanguage()

  return (
    <>
      <header className="hidden justify-between lg:flex">
        <div className="flex items-center gap-2">
          <Logo />
          <HeaderNavigationMenu />
        </div>

        <div className="flex gap-2">
          {!user && (
            <Link
              href={`/${language}/signup`}
              className="block cursor-pointer select-none space-y-1 rounded-md p-3 text-sm leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
            >
              <div className="flex items-center gap-2">
                <User width={12} height={12} />
                <p className="text-sm font-medium leading-none">
                  {dictionary.create_account}
                </p>
              </div>
            </Link>
          )}
          <CommandSearch />
          <SettingsDropdown />
        </div>
      </header>

      <header className="flex w-full items-center justify-between lg:hidden">
        <Logo />
        <HeaderNavigationDrawer />
      </header>
    </>
  )
}
