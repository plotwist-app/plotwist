import { Banner } from '@/components/banner'
import { cn } from '@/lib/utils'
import { tmdb } from '@/services/tmdb'
import type { PageProps } from '@/types/languages'
import { locale } from '@/utils/date/locale'
import { tmdbImage } from '@/utils/tmdb/image'
import { Badge } from '@plotwist/ui/components/ui/badge'
import { format } from 'date-fns'
import Image from 'next/image'
import type { PropsWithChildren } from 'react'
import { PersonTabs } from './_person_tabs'

type Props = PageProps<{ id: string }> & PropsWithChildren

export default async function Page({ params, children }: Props) {
  const { id, lang } = await params

  const {
    profile_path,
    name,
    birthday,
    known_for_department,
    place_of_birth,
    deathday,
    popularity,
  } = await tmdb.person.details(Number(id), lang)

  const { cast, crew } = await tmdb.person.combinedCredits(Number(id), lang)

  const mostPopularBackdrop = [...cast, ...crew].sort(
    (a, b) => b.vote_count - a.vote_count
  )[0].backdrop_path

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

              <p className="text-muted-foreground mt-2 text-sm">
                <span className="font-semibold text-foreground">
                  Nascimento:
                </span>{' '}
                {format(new Date(birthday), 'PPP', {
                  locale: locale[lang],
                })}{' '}
                ({place_of_birth})
              </p>

              {deathday && (
                <p className="text-muted-foreground mt-2 text-sm">
                  <span className="font-semibold text-foreground">Morte:</span>{' '}
                  {format(new Date(deathday), 'PPP', {
                    locale: locale[lang],
                  })}
                </p>
              )}

              {deathday && (
                <p className="text-muted-foreground mt-2 text-sm">
                  <span className="font-semibold text-foreground">
                    Popularidade:
                  </span>{' '}
                  {popularity}
                </p>
              )}

              <Badge className="mt-4">{known_for_department}</Badge>
            </div>
          </div>
        </aside>

        <section className="space-y-2 col-span-2 mt-8">
          <PersonTabs personId={id} />
          {children}
        </section>
      </section>
    </main>
  )
}
