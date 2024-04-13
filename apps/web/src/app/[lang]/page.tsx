import Link from 'next/link'
import { Suspense } from 'react'
import { Metadata } from 'next'

import { Button } from '@/components/ui/button'
import { Pattern } from '@/components/pattern'
import { Skeleton } from '@/components/ui/skeleton'

import { PageProps, Language } from '@/types/languages'
import { getDictionary } from '@/utils/dictionaries'

import { CounterSection } from './_components/count-section'
import { UserCount } from './_components/user-count'
import { HomeButton } from './_components/home-button'
import { HomeFeatures } from './_components/home-features'
import { APP_URL } from '../../../constants'

import { MovieDetails } from './movies/[id]/_components/movie-details'
import { Footer } from '@/components/footer'
import { SUPPORTED_LANGUAGES } from '../../../languages'
import { Pricing } from '@/components/pricing'

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
  const {
    home: { title, description, keywords },
  } = await getDictionary(lang)

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

  return {
    title,
    description,
    keywords,
    authors: [
      {
        name: 'lui7henrique',
      },
    ],
    openGraph: {
      title,
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
      creator: '@lui7henrique',
    },
    alternates: {
      canonical: canonicalUrl,
      languages: languageAlternates,
    },
  }
}

export default async function Home({ params: { lang } }: PageProps) {
  const dictionary = await getDictionary(lang)
  const {
    home: {
      title,
      description,
      secondary_button: secondaryButton,
      primary_button: primaryButton,
      statistics,
    },
  } = dictionary

  return (
    <>
      <Pattern variant="checkered" />

      <main className="">
        <div className="mx-auto max-w-4xl p-4">
          <section className="flex h-[75vh] items-center md:h-[50vh]">
            <div className="mx-auto flex w-4/5 flex-col items-center justify-center space-y-4 text-center">
              <h1 className="text-6xl font-bold">{title}</h1>
              <p className=" leading-6 text-muted-foreground">{description}</p>

              <div className="mt-2 flex gap-2">
                <Suspense
                  fallback={
                    <Button asChild variant="outline">
                      <Link href={`/${lang}/login`} prefetch={false}>
                        {primaryButton}
                      </Link>
                    </Button>
                  }
                >
                  <HomeButton language={lang} primaryButton={primaryButton} />
                </Suspense>

                <Button asChild>
                  <Link href={`/${lang}/signup`} prefetch={false}>
                    {secondaryButton}
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        </div>

        <section className="space-y-8 p-4 py-16">
          <div className="mx-auto aspect-[9/16] w-full max-w-6xl overflow-y-auto rounded-md border bg-background shadow-lg dark:shadow-none md:aspect-[16/9]">
            <Suspense fallback={<Skeleton className="h-full w-full" />}>
              <MovieDetails
                id={Number(homeMovies[lang])}
                language={lang}
                embed
              />
            </Suspense>
          </div>

          <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 md:grid-cols-5">
            <CounterSection
              label={statistics.movies.label}
              value={statistics.movies.value}
            />

            <CounterSection
              label={statistics.tv.label}
              value={statistics.tv.value}
            />

            <CounterSection
              label={statistics.episodes.label}
              value={statistics.episodes.value}
            />

            <CounterSection
              label={statistics.people.label}
              value={statistics.people.value}
            />

            <UserCount />
          </div>
        </section>

        <HomeFeatures language={lang} dictionary={dictionary} />
        <Pricing />
        <Footer language={lang} dictionary={dictionary} />
      </main>
    </>
  )
}
