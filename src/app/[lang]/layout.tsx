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

  // public/images/movie-pt-BR.jpg
  const image = `/images/home/movie-${params.lang}.jpg`

  return (
    <html lang={params.lang} className={spaceGrotesk.className}>
      <head>
        <title>TMDB</title>

        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2295%22>🎬</text></svg>"
        />

        <meta name="description" content={dictionary.home.description} />
        <meta name="title" content={dictionary.home.title} />
        <meta name="keywords" content={dictionary.home.keywords} />
        <meta name="theme-color" content="#FFFFFF" />
        <meta name="author" content="@lui7henrique" />

        <meta property="og:title" content={dictionary.home.title} />
        <meta property="og:description" content={dictionary.home.description} />
        <meta property="og:image" content={image} />
        <meta property="og:image:width" content="1280" />
        <meta property="og:image:height" content="720" />
        <meta property="og:image:alt" content={dictionary.home.title} />
        {/* <meta property="og:url" content="https://google.com" /> */}

        <meta name="twitter:title" content={dictionary.home.title} />
        <meta
          name="twitter:description"
          content={dictionary.home.description}
        />
        <meta name="twitter:image" content={image} />
        <meta name="twitter:card" content="summary_large_image" />
      </head>

      <body className="bg-background antialiased">
        <AppContextProvider>
          <LanguageContextProvider
            language={params.lang}
            dictionary={dictionary}
          >
            {children}
            <Toaster />
          </LanguageContextProvider>
        </AppContextProvider>
      </body>
    </html>
  )
}
