import { Space_Grotesk as SpaceGrotesk } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'

import { LanguageContextProvider } from '@/context/language'
import { Language } from '@/types/languages'
import { getDictionary } from '@/utils/dictionaries'

import { AppWrapper } from '@/context/app'

import '../globals.css'
import { SUPPORTED_LANGUAGES } from '../../../languages'
import { APP_URL } from '../../../constants'

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

  // public/images/movie-pt-BR.jpg
  const image = `${APP_URL}/images/home/movie-${params.lang}.jpg`

  return (
    <html lang={params.lang} className={spaceGrotesk.className}>
      <head>
        <title>TMDB</title>

        <link rel="icon" href="favicon.svg" />

        <meta name="description" content={dictionary.home.description} />
        <meta name="title" content={dictionary.home.title} />
        <meta name="keywords" content={dictionary.home.keywords} />
        <meta name="theme-color" content="#FFFFFF" />
        <meta name="author" content="@lui7henrique" />

        <meta property="og:title" content={dictionary.home.title} />
        <meta property="og:site_name" content="TMDB" />
        <meta property="og:description" content={dictionary.home.description} />
        <meta property="og:image" content={image} />
        <meta property="og:image:width" content="1280" />
        <meta property="og:image:height" content="720" />
        <meta property="og:image:alt" content={dictionary.home.title} />
        <meta property="og:url" content={APP_URL} />

        <meta name="twitter:title" content={dictionary.home.title} />
        <meta
          name="twitter:description"
          content={dictionary.home.description}
        />
        <meta name="twitter:image" content={image} />
        <meta name="twitter:card" content={image} />
        <meta name="twitter:creator" content="@lui7henrique" />
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
