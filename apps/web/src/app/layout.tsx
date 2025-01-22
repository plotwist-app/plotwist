import '@plotwist/ui/globals.css'

import { GTag } from '@/components/gtag'
import type { Language } from '@/types/languages'
import type { Metadata, Viewport } from 'next'
import { Space_Grotesk as SpaceGrotesk } from 'next/font/google'

import { ViewTransitions } from 'next-view-transitions'

const spaceGrotesk = SpaceGrotesk({ subsets: ['latin'], preload: true })

export const metadata: Metadata = {
  title: {
    template: '%s • Plotwist',
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

  return (
    <ViewTransitions>
      <html
        lang={params.lang}
        className={spaceGrotesk.className}
        suppressHydrationWarning
      >
        <head>
          <link rel="icon" href="/icon.ico" sizes="32x32" type="image/png" />
          <link
            rel="apple-touch-icon"
            href="/apple-icon.png"
            type="image/png"
            sizes="180x180"
          />

          <GTag />
        </head>

        <body className="bg-background antialiased">{children}</body>
      </html>
    </ViewTransitions>
  )
}
