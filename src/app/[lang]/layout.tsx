import { Space_Grotesk as SpaceGrotesk } from 'next/font/google'

import { Toaster } from '@/components/ui/sonner'

import '../globals.css'
import { AppContextProvider } from '@/context/app/app'
import { LanguageContextProvider } from '@/context/language'
import { Language } from '@/types/languages'
import { getDictionary } from '@/utils/dictionaries'
import { SUPPORTED_LANGUAGES } from '../../../languages'

const spaceGrotesk = SpaceGrotesk({ subsets: ['latin'] })

export async function generateStaticParams() {
  return SUPPORTED_LANGUAGES.map((lang) => ({ lang: lang.value }))
}

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
        <title>TMDB</title>

        <meta name="description" content={dictionary.home.description} />
        <meta name="title" content={dictionary.home.title} />
        <meta name="keywords" content={dictionary.home.keywords} />
        <meta name="theme-color" content="#FFF" />
      </head>

      <body className="bg-background antialiased">
        <AppContextProvider>
          <LanguageContextProvider
            language={params.lang}
            dictionary={dictionary}
          >
            {children}
            <Toaster closeButton />
          </LanguageContextProvider>
        </AppContextProvider>
      </body>
    </html>
  )
}
