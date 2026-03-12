'use client'

import { useMediaQuery } from '@/hooks/use-media-query'
import { CommandSearch } from '../command-search'
import { Logo } from '../logo'
import { HeaderAccount } from './header-account'
import { HeaderNavigationDrawer } from './header-navigation-drawer'
import { HeaderNavigationMenu } from './header-navigation-menu'

export const Header = () => {
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  return (
    <>
      <header className="hidden items-center justify-between lg:flex">
        <div className="flex items-center gap-3 z-50">
          <Logo />
          <div className="h-4 w-px bg-foreground/[0.1]" />
          <HeaderNavigationMenu />
        </div>

        <div className="flex items-center gap-2">
          {isDesktop && <CommandSearch />}
          <HeaderAccount />
        </div>
      </header>

      <header className="flex w-full items-center justify-between lg:hidden">
        <Logo />

        <div className="flex items-center gap-2">
          {!isDesktop && <CommandSearch />}
          <HeaderNavigationDrawer />
        </div>
      </header>
    </>
  )
}
