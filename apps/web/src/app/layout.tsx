import '@plotwist/ui/globals.css'

import { GTag } from '@/components/gtag'
import { SessionContextProvider } from '@/context/session'
import type { Language } from '@/types/languages'
import type { Metadata, Viewport } from 'next'
import { Space_Grotesk as SpaceGrotesk } from 'next/font/google'
import { verifySession } from './lib/dal'

const spaceGrotesk = SpaceGrotesk({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    template: 'Plotwist • %s',
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

      <body className="bg-background antialiased">
        <SessionContextProvider initialSession={session}>
          {children}
        </SessionContextProvider>
      </body>
    </html>
  )
}
