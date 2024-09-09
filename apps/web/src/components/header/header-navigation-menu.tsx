'use client'

import { useLanguage } from '@/context/language'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@plotwist/ui/components/ui/navigation-menu'

import { cn } from '@/lib/utils'

import { buildLanguageNavigation } from './header-navigation-data'
import { HeaderPopularMovie } from './header-popular-movie'
import { HeaderPopularTvSerie } from './header-popular-tv-serie'
// import { useAuth } from '@/context/auth'
// import { Bell } from 'lucide-react'

export const HeaderNavigationMenu = () => {
  const { dictionary, language } = useLanguage()
  const items = buildLanguageNavigation(dictionary)
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // const { user } = useAuth()

  const getIsActive = (href: string) => {
    const normalizedPath = pathname.replace(`/${language}`, '')

    if (href.includes('animes')) {
      const pathWithParams = `${normalizedPath}?type=${searchParams.get('type')}`

      return pathWithParams.includes(href)
    }

    return normalizedPath.includes(href)
  }

  return (
    <NavigationMenu>
      <NavigationMenuList>
        {items.map(({ label, items, icon: Icon, href }) => {
          const hasItems = Boolean(items?.length)

          if (hasItems)
            return (
              <NavigationMenuItem key={label}>
                <NavigationMenuTrigger
                  className={cn('gap-2', getIsActive(href) && 'bg-muted')}
                  arrow={hasItems}
                >
                  <Icon width={12} height={12} />
                  {label}
                </NavigationMenuTrigger>

                <NavigationMenuContent className="flex gap-4 p-4 md:w-[500px] lg:w-[700px]">
                  {href === '/movies' && (
                    <HeaderPopularMovie language={language} />
                  )}

                  {href === '/tv-series' && (
                    <HeaderPopularTvSerie language={language} />
                  )}

                  <ul className="grid w-2/3 gap-3 lg:grid-cols-2">
                    {items?.map(({ href, icon: Icon, label, description }) => (
                      <li key={label}>
                        <NavigationMenuLink asChild>
                          <Link
                            className={cn(
                              'block cursor-pointer select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
                              getIsActive(href) && 'bg-muted',
                            )}
                            href={`/${language}${href}`}
                          >
                            <div className="flex items-center gap-2">
                              <Icon width={12} height={12} />
                              <div className="text-sm font-medium leading-none">
                                {label}
                              </div>
                            </div>

                            <p className="line-clamp-3 text-xs leading-snug text-muted-foreground">
                              {description}
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            )

          return (
            <NavigationMenuItem
              key={label}
              className={cn(
                navigationMenuTriggerStyle(),
                getIsActive(href) && 'bg-muted',
              )}
              asChild
            >
              <Link
                href={`/${language}${href}`}
                className="flex items-center gap-2"
              >
                <Icon width={12} height={12} />
                {label}
              </Link>
            </NavigationMenuItem>
          )
        })}
      </NavigationMenuList>
    </NavigationMenu>
  )
}
