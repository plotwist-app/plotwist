import { Metadata } from 'next'
import { ViewTransitions } from 'next-view-transitions'
import { Space_Grotesk as SpaceGrotesk } from 'next/font/google'
import { Language } from '@/types/languages'
import { GTag } from '@/components/gtag'

import './globals.css'

const spaceGrotesk = SpaceGrotesk({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    template: 'Plotwist • %s',
    default: 'Plotwist',
  },
  icons: {
    icon: '/logo-white.svg',
  },
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { lang: Language }
}) {
  return (
    <ViewTransitions>
      <html
        lang={params.lang}
        className={spaceGrotesk.className}
        suppressHydrationWarning
      >
        <head>
          <link rel="icon" href="/logo-white.svg" />
          <meta name="theme-color" content="#09090b" />
          <GTag />
        </head>

        <body className="bg-background antialiased">{children}</body>
      </html>
    </ViewTransitions>
  )
}
