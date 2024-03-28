'use client'

import Link from 'next/link'
import { CommandSearch } from '../command-search'
import { SettingsDropdown } from '../settings-dropdown'
import { HeaderNavigationMenu } from './header-navigation-menu'
import { useLanguage } from '@/context/language'
import { HeaderNavigationDrawer } from './header-navigation-drawer'
import Image from 'next/image'

export const Header = () => {
  const { language } = useLanguage()

  const logo = (
    <Link
      href={`/${language}/`}
      className="flex items-center gap-2 text-foreground"
    >
      <div className="">
        <Image
          src="/logo-black.svg"
          alt="Logo"
          width={24}
          height={24}
          className="dark:hidden"
        />

        <Image
          src="/logo-white.svg"
          alt="Logo"
          width={24}
          height={24}
          className="hidden dark:block"
        />
      </div>
    </Link>
  )

  return (
    <>
      <header className="hidden justify-between lg:flex">
        <div className="flex items-center gap-2">
          {logo}
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
        {logo}

        <HeaderNavigationDrawer />
      </header>
    </>
  )
}
