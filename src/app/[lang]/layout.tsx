import { Space_Grotesk as SpaceGrotesk } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'

import { LanguageContextProvider } from '@/context/language'
import { Language } from '@/types/languages'
import { getDictionary } from '@/utils/dictionaries'

import { AppWrapper } from '@/context/app'

import '../globals.css'
import { SUPPORTED_LANGUAGES } from '../../../languages'

const spaceGrotesk = SpaceGrotesk({ subsets: ['latin'] })

export async function generateStaticParams() {
  return SUPPORTED_LANGUAGES.map((lang) => ({ lang: lang.value }))
}

export const dynamic = 'force-dynamic'

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { lang: Language }
}) {
  const dictionary = await getDictionary(params.lang)

  return (
    <html lang={params.lang} className={spaceGrotesk.className}>
      <head>
        <link rel="icon" href="favicon.svg" />
        <meta name="theme-color" content="#FFFFFF" />
      </head>

      <body className="bg-background antialiased">
        <AppWrapper>
          <LanguageContextProvider
            language={params.lang}
            dictionary={dictionary}
          >
            {children}
            <Toaster />
          </LanguageContextProvider>
        </AppWrapper>
      </body>
    </html>
  )
}
