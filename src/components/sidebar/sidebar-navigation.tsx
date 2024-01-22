'use client'

import { useLanguage } from '@/context/language'
import { buildLanguageNavigation } from './sidebar-navigation-data'
import { SidebarNavigationItem } from './sidebar-navigation-item'

import { Accordion } from '@/components/ui/accordion'
import { SidebarSearch } from '.'

export const SidebarNavigation = () => {
  const { dictionary } = useLanguage()

  return (
    <div className="space-y-4">
      <SidebarSearch />

      <Accordion type="multiple">
        <nav className="flex flex-col space-y-2">
          {buildLanguageNavigation(dictionary).map((item) => {
            return <SidebarNavigationItem {...item} key={item.href} />
          })}
        </nav>
      </Accordion>
    </div>
  )
}
