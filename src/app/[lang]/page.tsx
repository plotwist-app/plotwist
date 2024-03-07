import Link from 'next/link'

import { Button } from '@/components/ui/button'

import { PageProps, Language } from '@/types/languages'
import { getDictionary } from '@/utils/dictionaries'
import { CounterSection } from './_components/count-section'
import { Pattern } from '@/components/pattern'

import { UserCount } from './_components/user-count'
import { HomeButton } from './_components/home-button'
import { Suspense } from 'react'
import { HomeFeatures } from './_components/home-features/home-features'
import { HomePrices } from './_components/home-prices'
import { Metadata } from 'next'
import { APP_URL } from '../../../constants'
import MoviePage from './movies/[id]/page'

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
  params,
}: PageProps): Promise<Metadata> {
  const {
    home: { title, description, keywords },
  } = await getDictionary(params.lang)

  const image = `${APP_URL}/images/home/movie-${params.lang}.jpg`

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
      siteName: '[TMDB]',
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
              <h1 className="text-5xl font-bold">{title}</h1>
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
            <MoviePage params={{ id: homeMovies[lang], lang, embed: true }} />
          </div>

          <div className="mx-auto grid max-w-4xl grid-cols-1 items-center gap-8 md:grid-cols-5">
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
        <HomePrices language={lang} />

        {/* <section className="mx-auto max-w-article space-y-4">
          <div className="flex flex-col gap-2">
            <div className="h-12 rounded-md border"></div>
            <div className="h-12 rounded-md border"></div>
            <div className="h-12 rounded-md border"></div>
            <div className="h-12 rounded-md border"></div>
            <div className="h-12 rounded-md border"></div>
          </div>
        </section> */}
      </main>
    </>
  )
}
