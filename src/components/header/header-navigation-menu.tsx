'use client'

import { useLanguage } from '@/context/language'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '../ui/navigation-menu'
import { buildLanguageNavigation } from '../sidebar/sidebar-navigation-data'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export const HeaderNavigationMenu = () => {
  const { dictionary, language } = useLanguage()
  const items = buildLanguageNavigation(dictionary)

  return (
    <NavigationMenu>
      <NavigationMenuList>
        {items.map(({ label, items, icon: Icon, href }) => {
          const hasItems = Boolean(items?.length)

          return (
            <NavigationMenuItem key={label}>
              <NavigationMenuTrigger className="gap-2 p-2" arrow={hasItems}>
                {hasItems ? (
                  <>
                    <Icon width={12} height={12} />
                    {label}
                  </>
                ) : (
                  <Link
                    href={`/${language}${href}`}
                    className="flex items-center gap-2"
                  >
                    <Icon width={12} height={12} />
                    {label}
                  </Link>
                )}
              </NavigationMenuTrigger>

              {hasItems && (
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                    {items?.map(({ href, icon: Icon, label }) => (
                      <li key={label}>
                        <NavigationMenuLink asChild>
                          <Link
                            className={cn(
                              'block cursor-pointer select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
                            )}
                            href={`/${language}${href}`}
                          >
                            <div className="flex items-center gap-2">
                              <Icon width={12} height={12} />
                              <div className="text-sm font-medium leading-none">
                                {label}
                              </div>
                            </div>

                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              {label}
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              )}
            </NavigationMenuItem>
          )
        })}
      </NavigationMenuList>
    </NavigationMenu>
  )
}
