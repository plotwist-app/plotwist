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
  const isOnboarding = pathname?.includes('/onboarding') ?? false
  const isTogether = pathname?.includes('/together') ?? false

  const hideChrome = isOnboarding || isTogether

  return (
    <>
      <div className="flex flex-col">
        {!hideChrome && (
          <div className="mx-auto w-full max-w-6xl border-b bg-background px-4 py-2 lg:my-4 lg:rounded-full lg:border">
            {header}
          </div>
        )}

        <main className="w-full min-h-screen">{children}</main>

        {!hideChrome && footer}
      </div>

      {!hideChrome && proBadge}
    </>
  )
}
