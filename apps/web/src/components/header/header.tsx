'use client'

import { CommandSearch } from '../command-search'
import { HeaderNavigationMenu } from './header-navigation-menu'
import { HeaderNavigationDrawer } from './header-navigation-drawer'
import { Logo } from '../logo'
import { HeaderAccount } from './header-account'
import { useMediaQuery } from '@/hooks/use-media-query'

export const Header = () => {
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  return (
    <>
      <header className="hidden justify-between lg:flex">
        <div className="flex items-center gap-2 z-50">
          <Logo />
          <HeaderNavigationMenu />
        </div>

        <div className="flex items-center gap-2">
          {isDesktop && <CommandSearch />}
          <HeaderAccount />
        </div>
      </header>

      <header className="flex w-full items-center justify-between lg:hidden">
        <Logo />

        <div className="flex space-x-2">
          {!isDesktop && <CommandSearch />} <HeaderNavigationDrawer />
        </div>
      </header>
    </>
  )
}
