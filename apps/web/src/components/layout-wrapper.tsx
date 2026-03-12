'use client'

import { usePathname } from 'next/navigation'

export function LayoutWrapper({
  header,
  footer,
  children,
  proBadge,
}: {
  header: React.ReactNode
  footer: React.ReactNode
  children: React.ReactNode
  proBadge?: React.ReactNode
}) {
  const pathname = usePathname()
  const isOnboarding = pathname?.includes('/onboarding')

  return (
    <>
      <div className="flex flex-col">
        {!isOnboarding && (
          <div className="mx-auto w-full max-w-6xl border-b bg-background px-4 py-2 lg:my-4 lg:rounded-full lg:border">
            {header}
          </div>
        )}

        <main className="w-full min-h-screen">{children}</main>

        {!isOnboarding && footer}
      </div>

      {!isOnboarding && proBadge}
    </>
  )
}
