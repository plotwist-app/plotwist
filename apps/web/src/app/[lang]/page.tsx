import { Metadata } from 'next'

import { Pattern } from '@/components/pattern'
import { Footer } from '@/components/footer'

import { PageProps, Language } from '@/types/languages'
import { getDictionary } from '@/utils/dictionaries'

import { APP_URL } from '../../../constants'

import { SUPPORTED_LANGUAGES } from '../../../languages'
import { TopMovies } from './_components/top-movies'
import { BentoGrid } from './_components/bento-grid'
import { Hero } from './_components/hero'

export const homeMovies: Record<Language, string> = {
  'en-US': '27205',
  'es-ES': '1417',
  'fr-FR': '194',
  'de-DE': '582',
  'it-IT': '637',
  'pt-BR': '598',
  'ja-JP': '129',
}

export async function generateMetadata({
  params: { lang },
}: PageProps): Promise<Metadata> {
  const dictionary = await getDictionary(lang)

  const image = `${APP_URL}/images/home/movie-${lang}.jpg`
  const canonicalUrl = `${APP_URL}/${lang}`

  const languageAlternates = SUPPORTED_LANGUAGES.reduce(
    (acc, lang) => {
      if (lang.enabled) {
        acc[lang.hreflang] = `${APP_URL}/${lang.value}`
      }
      return acc
    },
    {} as Record<string, string>,
  )

  const title = dictionary.your_cinema_platform
  const description = dictionary.join_plotwist

  return {
    title,
    description,
    keywords: dictionary.home.keywords,
    openGraph: {
      title: `Plotwist ${title}`,
      description,
      siteName: 'Plotwist',
      url: APP_URL,
      images: [
        {
          url: image,
          width: 1280,
          height: 720,
          alt: title,
        },
      ],
    },
    twitter: {
      title,
      description,
      card: 'summary_large_image',
    },
    alternates: {
      canonical: canonicalUrl,
      languages: languageAlternates,
    },
  }
}

export default async function Home({ params: { lang } }: PageProps) {
  const dictionary = await getDictionary(lang)

  return (
    <>
      <Pattern variant="checkered" />

      <main className="">
        <Hero />
        <TopMovies language={lang} />
        <BentoGrid />
        <Footer language={lang} dictionary={dictionary} />
      </main>
    </>
  )
}
