'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { Item, NAVIGATION } from './sidebar'

const FLAT_NAVIGATION = NAVIGATION.flatMap((nav) => [
  nav,
  ...(nav.items ? nav.items : []),
])

const getFilteredItems = (pathname: string) => {
  const sanitizedPath = pathname.split('/').filter(Boolean)
  const formattedPath = sanitizedPath.map((item) => `/${item}`)
  const matchingItems = formattedPath.map((item) =>
    FLAT_NAVIGATION.find((nav) => nav?.href.endsWith(item)),
  )
  const filteredItems = matchingItems.filter(Boolean)

  return filteredItems as Item[]
}

export const BreadCrumb = () => {
  const pathname = usePathname()

  const items = getFilteredItems(pathname)

  return (
    <div className="flex items-center gap-4">
      {items.map((item, index) => {
        if (!item) return null

        const isLast = index >= items.length - 1
        const isActive = pathname === item.href

        const Icon = item.icon

        return (
          <>
            <Link
              href={item.href}
              className={cn(
                'flex items-center gap-2 text-sm text-muted-foreground underline-offset-2 hover:underline',
                isActive ? 'text-bold text-foreground' : '',
              )}
              key={item.href}
            >
              <Icon width={14} height={14} />

              {item.label}
            </Link>

            {!isLast && <Separator className="h-5" orientation="vertical" />}
          </>
        )
      })}
    </div>
  )
}
