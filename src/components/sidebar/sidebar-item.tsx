'use client'

import { useMemo } from 'react'
import { LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { cn } from '@/lib/utils'

export type Item = {
  label: string
  href: string
  icon: LucideIcon
  items?: Item[]
}

export type SidebarItemProps = Item & {
  items?: Item[]
}

export const SidebarItem = ({
  href,
  icon: Icon,
  label,
  items,
}: SidebarItemProps) => {
  const path = usePathname()
  const { lang } = useParams<{ lang: string }>()

  const isActive = useMemo(() => {
    if (href === `${lang}/app`) {
      return path === `${lang}/app`
    }

    return path.includes(href)
  }, [href, lang, path])

  if (items)
    return (
      <div>
        <AccordionItem value={href} className="border-b-0">
          <AccordionTrigger className="rounded-lg px-3 py-2">
            <div className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
              <Icon width={16} height={16} />
              {label}
            </div>
          </AccordionTrigger>

          <AccordionContent className="ml-3 space-y-1 px-3 pb-0">
            {items.map((item) => (
              <SidebarItem {...item} key={item.label} />
            ))}
          </AccordionContent>
        </AccordionItem>
      </div>
    )

  return (
    <Link
      href={`/${lang}${href}`}
      className={cn(
        'flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm',
        isActive
          ? 'bg-muted font-bold'
          : 'font-normal text-muted-foreground hover:bg-muted',
      )}
      key={href}
    >
      <Icon width={16} height={16} />
      {label}
    </Link>
  )
}
