'use client'

import Link from 'next/link'
import { CommandSearch } from '../command-search'
import { SettingsDropdown } from '../settings-dropdown'
import { HeaderNavigationMenu } from './header-navigation-menu'
import { useLanguage } from '@/context/language'
import { HeaderNavigationDrawer } from './haeder-navigation-drawer'

export const Header = () => {
  const { language } = useLanguage()

  return (
    <>
      <header className="hidden justify-between lg:flex">
        <div className="flex items-center gap-4">
          <Link href={`/${language}/`}>
            <h1 className="text-xl font-semibold">Plotwist</h1>
          </Link>

          <HeaderNavigationMenu />
        </div>

        <div className="flex gap-2">
          <CommandSearch />
          <div>
            <SettingsDropdown />
          </div>
        </div>
      </header>

      <header className="flex w-full justify-between lg:hidden">
        <Link href={`/${language}/`}>
          <h1 className="text-xl font-semibold">Plotwist</h1>
        </Link>

        <HeaderNavigationDrawer />
      </header>
    </>
  )
}
