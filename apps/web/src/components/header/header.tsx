'use client'

import { CommandSearch } from '../command-search'
import { HeaderNavigationMenu } from './header-navigation-menu'
import { HeaderNavigationDrawer } from './header-navigation-drawer'
import { Logo } from '../logo'
import { HeaderAccount } from './header-account'

export const Header = () => {
  return (
    <>
      <header className="hidden justify-between lg:flex">
        <div className="flex items-center gap-2">
          <Logo />
          <HeaderNavigationMenu />
        </div>

        <div className="flex items-center gap-2">
          <CommandSearch />
          <HeaderAccount />
        </div>
      </header>

      <header className="flex w-full items-center justify-between lg:hidden">
        <Logo />
        <HeaderNavigationDrawer />
      </header>
    </>
  )
}
