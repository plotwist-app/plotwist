import { Metadata } from 'next'
import { Space_Grotesk as SpaceGrotesk } from 'next/font/google'
import { Language } from '@/types/languages'
import { GTag } from '@/components/gtag'

import './globals.css'
import { SUPPORTED_LANGUAGES } from '../../languages'

const spaceGrotesk = SpaceGrotesk({ subsets: ['latin'] })
export async function generateStaticParams() {
  return SUPPORTED_LANGUAGES.map((lang) => ({ lang: lang.value }))
}
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: {
    template: 'Plotwist • %s',
    default: 'Plotwist',
  },
  icons: {
    icon: '/favicon.svg',
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
    <html
      lang={params.lang}
      className={spaceGrotesk.className}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="favicon.svg" />
        <meta name="theme-color" content="#09090b" />
        <GTag />
      </head>

      <body className="bg-background antialiased">{children}</body>
    </html>
  )
}
