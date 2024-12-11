import { Banner } from '@/components/banner'
import { cn } from '@/lib/utils'
import { tmdb } from '@/services/tmdb'
import type { PageProps } from '@/types/languages'
import { tmdbImage } from '@/utils/tmdb/image'
import Image from 'next/image'
import type { PropsWithChildren } from 'react'
import { Biography } from './_biography'

type PersonPageProps = PageProps<Record<'id', string>> & PropsWithChildren

export default async function PersonPage({
  params,
  children,
}: PersonPageProps) {
  const { id, lang } = await params

  const { profile_path, name, biography } = await tmdb.person.details(
    Number(id),
    lang
  )

  const { cast, crew } = await tmdb.person.combinedCredits(Number(id), lang)

  const mostPopularBackdrop = [...cast, ...crew]
    .sort((a, b) => b.vote_count - a.vote_count)
    .filter(credit => credit.backdrop_path)[0]?.backdrop_path

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
              'flex flex-col items-center gap-8 text-center justify-center sticky top-24',
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

              <Biography content={biography} />
            </div>
          </div>
        </aside>

        <section className="space-y-2 col-span-2 mt-8">{children}</section>
      </section>
    </main>
  )
}
