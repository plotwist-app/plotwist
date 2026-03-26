'use client'

import { ArrowLeft, Moon, Sun, Trophy } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/admin/achievements', label: 'Achievements', icon: Trophy },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const lang = pathname.split('/')[1]
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col bg-[var(--gray-2)] text-[var(--gray-12)]">
      <div className="px-5 py-5">
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--gray-9)]">
          Plotwist Admin
        </p>
      </div>

      <nav className="flex-1 space-y-0.5 px-3">
        {NAV_ITEMS.map(item => {
          const fullHref = `/${lang}${item.href}`
          const isActive = pathname.startsWith(fullHref)

          return (
            <Link
              key={item.href}
              href={fullHref}
              className={cn(
                'flex items-center gap-2.5 rounded-md px-3 py-1.5 text-sm transition-colors',
                isActive
                  ? 'bg-[var(--gray-4)] font-medium text-[var(--gray-12)]'
                  : 'text-[var(--gray-11)]'
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="flex items-center justify-between border-t border-[var(--gray-4)] px-3 py-4">
        <Link
          href={`/${lang}/home`}
          className="flex items-center gap-2.5 rounded-md px-3 py-1.5 text-sm text-[var(--gray-11)] transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back to app
        </Link>

        <button
          type="button"
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          className="rounded-md p-1.5 text-[var(--gray-11)] transition-colors hover:bg-[var(--gray-4)] hover:text-[var(--gray-12)]"
        >
          {resolvedTheme === 'dark' ? (
            <Sun className="size-4" />
          ) : (
            <Moon className="size-4" />
          )}
        </button>
      </div>
    </aside>
  )
}
