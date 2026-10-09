import '@plotwist/ui/globals.css'
import '../together.css'

import type { Metadata, Viewport } from 'next'
import { Instrument_Sans } from 'next/font/google'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import { GoogleAnalytics } from '@/components/google-analytics'
import { Providers } from '@/components/providers'
import { TogetherThemeRoot } from '@/components/together-theme-root'
import { LanguageProvider } from '@/context/language'
import { getDictionary } from '@/dictionaries'
import { APP_URL } from '@/lib/constants'
import { buildTitle } from '@/lib/metadata'
import { isLanguage, LANGUAGES } from '@/types/languages'

const MEASUREMENT_ID = process.env.NEXT_PUBLIC_MEASUREMENT_ID

const sans = Instrument_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-together',
})

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#0b0b09',
}

export function generateStaticParams() {
  return LANGUAGES.map(lang => ({ lang }))
}

type LayoutProps = {
  children: ReactNode
  params: Promise<{ lang: string }>
}

export async function generateMetadata(props: LayoutProps): Promise<Metadata> {
  const { lang } = await props.params
  const dictionary = await getDictionary(lang)

  return {
    metadataBase: new URL(APP_URL),
    title: buildTitle(dictionary),
    description: dictionary.together.subtitle,
  }
}

export default async function RootLayout({ children, params }: LayoutProps) {
  const { lang } = await params
  if (!isLanguage(lang)) notFound()

  const dictionary = await getDictionary(lang)

  return (
    <html lang={lang} className={`dark ${sans.variable}`}>
      <body className="bg-background antialiased">
        <Providers>
          <LanguageProvider language={lang} dictionary={dictionary}>
            <TogetherThemeRoot>{children}</TogetherThemeRoot>
          </LanguageProvider>
        </Providers>
        {MEASUREMENT_ID ? (
          <GoogleAnalytics measurementId={MEASUREMENT_ID} />
        ) : null}
      </body>
    </html>
  )
}
