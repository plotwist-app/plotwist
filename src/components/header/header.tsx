'use client'

import Link from 'next/link'
import { CommandSearch } from '../command-search'
import { SettingsDropdown } from '../settings-dropdown'
import { HeaderNavigationMenu } from './header-navigation-menu'
import { useLanguage } from '@/context/language'
import { useMediaQuery } from '@uidotdev/usehooks'
import { HeaderNavigationDrawer } from './haeder-navigation-drawer'

export const Header = () => {
  const { language } = useLanguage()
  const isDesktop = useMediaQuery('(min-width: 1080px)')

  if (isDesktop) {
    return (
      <header className="flex justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/${language}/`}>
            <h1 className="text-xl font-semibold">[TMDB]</h1>
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
    )
  }

  return (
    <header className="flex w-full justify-between">
      <Link href={`/${language}/`}>
        <h1 className="text-xl font-semibold">[TMDB]</h1>
      </Link>

      <HeaderNavigationDrawer />
    </header>
  )
}
