import { Space_Grotesk as SpaceGrotesk } from 'next/font/google'
import { Language } from '@/types/languages'

import './globals.css'
import { SUPPORTED_LANGUAGES } from '../../languages'
import { Metadata } from 'next'

const spaceGrotesk = SpaceGrotesk({ subsets: ['latin'] })
export async function generateStaticParams() {
  return SUPPORTED_LANGUAGES.map((lang) => ({ lang: lang.value }))
}
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: {
    template: '[TMDB] • %s',
    default: '[TMDB]',
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
    <html lang={params.lang} className={spaceGrotesk.className}>
      <head>
        <link rel="icon" href="favicon.svg" />
        <meta name="theme-color" content="#FFFFFF" />
      </head>

      <body className="bg-background antialiased">{children}</body>
    </html>
  )
}
