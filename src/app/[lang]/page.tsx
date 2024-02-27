import Link from 'next/link'

import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'

import { PageProps, Language } from '@/types/languages'
import { getDictionary } from '@/utils/dictionaries'
import { CounterSection } from './_components/count-section'
import { Pattern } from '@/components/pattern'
import MoviePage from '@/app/[lang]/app/movies/[id]/page'

import { UserCount } from './_components/user-count'
import { HomeButton } from './_components/home-button'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export const homeMovies: Record<Language, string> = {
  'en-US': '27205',
  'es-ES': '1417',
  'fr-FR': '194',
  'de-DE': '582',
  'it-IT': '637',
  'pt-BR': '598',
  'ja-JP': '129',
}

export default async function Home({ params: { lang } }: PageProps) {
  const {
    home: {
      title,
      description,
      secondary_button: secondaryButton,
      primary_button: primaryButton,
      statistics,
    },
  } = await getDictionary(lang)

  return (
    <>
      <Pattern variant="checkered" />

      <main className="">
        <div className="mx-auto max-w-4xl p-4">
          <Header />

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

        <section className="space-y-8 p-4">
          <div className="mx-auto aspect-[9/16] w-full max-w-article overflow-y-auto rounded-md border bg-background shadow-lg dark:shadow-none md:aspect-[16/9]">
            <Suspense fallback={<Skeleton className="h-full w-full" />}>
              <MoviePage params={{ id: homeMovies[lang], lang, embed: true }} />
            </Suspense>
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
      </main>
    </>
  )
}
