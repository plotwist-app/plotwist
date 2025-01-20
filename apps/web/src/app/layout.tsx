import '@plotwist/ui/globals.css'

import type { GetUserPreferences200 } from '@/api/endpoints.schemas'
import { getUserPreferences } from '@/api/users'
import { GTag } from '@/components/gtag'
import type { Language } from '@/types/languages'
import type { Metadata, Viewport } from 'next'
import { Space_Grotesk as SpaceGrotesk } from 'next/font/google'
import { verifySession } from './lib/dal'

const spaceGrotesk = SpaceGrotesk({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    template: 'Plotwist / %s',
    default: 'Plotwist',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#09090b',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default async function RootLayout(props: {
  children: React.ReactNode
  params: Promise<{ lang: Language }>
}) {
  const params = await props.params
  const { children } = props

  const session = await verifySession()

  let userPreferences: GetUserPreferences200['userPreferences'] | undefined

  if (session?.user) {
    const { userPreferences: userPreferencesData } = await getUserPreferences()
    userPreferences = userPreferencesData
  }

  return (
    <html
      lang={params.lang}
      className={spaceGrotesk.className}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" type="image" />
        <link
          rel="apple-touch-icon"
          href="/apple-icon.png"
          type="image"
          sizes="any"
        />

        <GTag />
      </head>

      <body className="bg-background antialiased">{children}</body>
    </html>
  )
}
