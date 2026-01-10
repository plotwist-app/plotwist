'use client'

import { ScrollArea } from '@plotwist/ui/components/ui/scroll-area'
import { usePathname, useRouter } from 'next/navigation'
import { Link } from 'next-view-transitions'
import { type PropsWithChildren, useState } from 'react'
import { useLanguage } from '@/context/language'
import { cn } from '@/lib/utils'
import { buildNavigation } from './_navigation'

function NavigationDesktop() {
  const pathname = usePathname()
  const { dictionary, language } = useLanguage()

  return (
    <aside className="sticky top-14 hidden h-[calc(100dvh-theme(spacing.16))] w-[220px] shrink-0 pt-8 md:block">
      <ScrollArea className="h-full w-full">
        <nav>
          <ul className="h-full">
            {buildNavigation(dictionary).map((item, index) => {
              return (
                <li className="mb-6" key={`${item.name}-${index}`}>
                  <div className="text-sm/6 font-[450] text-zinc-950 dark:text-white">
                    {item.name}
                  </div>

                  <ul className="mt-4 space-y-3.5 border-l border-zinc-200 dark:border-zinc-800">
                    {item.children.map(child => {
                      const isActive = pathname.includes(child.href)

                      return (
                        <li key={child.href}>
                          <Link
                            className={cn(
                              'relative inline-flex items-center space-x-1 pl-4 text-sm font-normal text-zinc-700 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white',

                              isActive &&
                                'text-zinc-950 before:absolute before:inset-y-0 before:left-[-1.5px] before:w-[2px] before:rounded-full before:bg-zinc-950 dark:text-white dark:before:bg-white',

                              child.isDisabled &&
                                'opacity-50 cursor-default pointer-events-none'
                            )}
                            href={`/${language}${child.href}`}
                          >
                            <span>{child.name}</span>

                            {child?.isNew && (
                              <span className="whitespace-nowrap rounded-lg bg-emerald-100 px-2 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-50">
                                {dictionary.new}
                              </span>
                            )}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </li>
              )
            })}
          </ul>
        </nav>
      </ScrollArea>
    </aside>
  )
}

function NavigationMobile() {
  const router = useRouter()
  const pathname = usePathname()
  const { dictionary, language } = useLanguage()
  const [selectedHref, setSelectedHref] = useState(pathname)

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const href = e.target.value
    setSelectedHref(href)
    router.push(`/${language}${href}`)
  }

  return (
    <div className="block w-full pt-8 md:hidden">
      <select
        className="block w-full appearance-none rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
        value={selectedHref}
        onChange={handleChange}
      >
        {buildNavigation(dictionary).map(item => {
          return (
            <optgroup label={item.name} key={item.name}>
              {item.children.map(child => (
                <option
                  key={child.href}
                  value={child.href}
                  disabled={child.isDisabled}
                >
                  {child.name}
                </option>
              ))}
            </optgroup>
          )
        })}
      </select>
    </div>
  )
}

export default async function Layout({ children }: PropsWithChildren) {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="mx-auto flex w-full flex-col items-start md:flex-row md:space-x-8 px-4 xl:px-0">
        <NavigationDesktop />
        <NavigationMobile />

        <main className="prose prose-zinc min-w-0 max-w-full flex-1 pb-16 pt-8 dark:prose-invert prose-h1:scroll-m-20 prose-h1:text-2xl prose-h1:font-semibold prose-h2:scroll-m-20 prose-h2:text-xl prose-h2:font-medium prose-h3:scroll-m-20 prose-h3:text-base prose-h3:font-medium prose-h4:scroll-m-20 prose-h5:scroll-m-20 prose-h6:scroll-m-20 prose-strong:font-medium prose-table:block prose-table:overflow-y-auto xl:max-w-2xl prose-blockquote:text-muted-foreground prose-blockquote:text-sm">
          {children}
        </main>
      </div>
    </div>
  )
}
