'use client'

import { CommandSearch } from '../command-search'
import { SettingsDropdown } from '../settings-dropdown'
import { HeaderNavigationMenu } from './header-navigation-menu'
import { HeaderNavigationDrawer } from './header-navigation-drawer'
import { Logo } from '../logo'
import { HeaderProfile } from './header-profile'

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
          <SettingsDropdown />
          <HeaderProfile />
        </div>
      </header>

      <header className="flex w-full items-center justify-between lg:hidden">
        <Logo />
        <HeaderNavigationDrawer />
      </header>
    </>
  )
}
