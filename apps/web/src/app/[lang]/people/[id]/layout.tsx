import type { Metadata } from 'next'
import Image from 'next/image'
import type { PropsWithChildren } from 'react'
import { Banner } from '@/components/banner'
import { cn } from '@/lib/utils'
import { tmdb } from '@/services/tmdb'
import { asLanguage, type PageProps } from '@/types/languages'
import { tmdbImage } from '@/utils/tmdb/image'
import { Biography } from './_biography'
import { Infos } from './_infos'

type PersonPageProps = PageProps<Record<'id', string>> & PropsWithChildren

export async function generateMetadata(
  props: PersonPageProps
): Promise<Metadata> {
  const { params } = props
  const { id, lang: langParam } = await params
  const lang = asLanguage(langParam)

  const { profile_path, name, biography } = await tmdb.person.details(
    Number(id),
    lang
  )

  const title = name
  const description = biography ? `${biography.slice(0, 150)}...` : ''
  const images = profile_path
    ? [tmdbImage(profile_path, 'original')]
    : undefined

  return {
    title: `${title} • Plotwist`,
    description,
    openGraph: {
      title: `${title} • Plotwist`,
      description,
      siteName: 'Plotwist',
      images: images,
    },
    twitter: {
      title: `${title} • Plotwist`,
      description,
      images: images,
      card: 'summary_large_image',
    },
  }
}

export default async function PersonPage({
  params,
  children,
}: PersonPageProps) {
  const { id, lang: langParam } = await params
  const lang = asLanguage(langParam)
  const person = await tmdb.person.details(Number(id), lang)
  const { profile_path, name, biography } = person

  const { cast, crew } = await tmdb.person.combinedCredits(Number(id), lang)

  const mostPopularBackdrop = [...cast, ...crew]
    .sort((a, b) => b.vote_count - a.vote_count)
    .filter(credit => credit.backdrop_path)[0]?.backdrop_path

  const uniqueCredits = [...cast, ...crew].filter(
    (credit, index, self) => index === self.findIndex(t => t.id === credit.id)
  )

  return (
    <main className="pb-16 mx-auto max-w-6xl">
      <Banner
        className=""
        url={mostPopularBackdrop && tmdbImage(mostPopularBackdrop, 'original')}
      />

      <section
        className={cn(
          'mx-auto max-w-5xl px-4',
          'flex flex-col',
          'lg:grid lg:grid-cols-3 lg:px-0 lg:gap-8'
        )}
      >
        <aside className="flex flex-col space-y-4 col-span-1 relative">
          <div
            className={cn(
              'flex flex-col items-center gap-4 text-center justify-center',
              'lg:justify-start lg:flex-col lg:text-start lg:items-start'
            )}
          >
            <div
              className={cn(
                'flex flex-col items-center justify-center gap-2 w-full',
                'lg:block lg:flex-row'
              )}
            >
              <div className="relative z-40 flex aspect-square  items-center justify-center overflow-hidden rounded-full border bg-muted text-3xl -mt-20 w-40">
                {profile_path ? (
                  <Image
                    src={tmdbImage(profile_path)}
                    fill
                    alt=""
                    className="object-cover"
                  />
                ) : (
                  name[0].toUpperCase()
                )}
              </div>

              <h1 className="text-3xl font-bold mt-2">{name}</h1>

              <Biography content={biography} title={name} />
            </div>

            <div className="hidden lg:block">
              <Infos
                personDetails={person}
                creditsCount={uniqueCredits.length}
              />
            </div>
          </div>
        </aside>

        <section className="space-y-2 col-span-2 mt-8">{children}</section>
      </section>
    </main>
  )
}
