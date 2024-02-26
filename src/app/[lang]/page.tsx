import Link from 'next/link'

import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { getUserService } from '@/services/api/users/get-user'
import { supabase } from '@/services/supabase'
import { PageProps, Language } from '@/types/languages'
import { getDictionary } from '@/utils/dictionaries'
import { CounterSection } from './_components/count-section'
import { Pattern } from '@/components/pattern'
import MoviePage from '@/app/[lang]/app/movies/[id]/page'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { UserCount } from './_components/user-count'

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
  console.time('getDictionary')
  const {
    home: {
      title,
      description,
      primary_button: primaryButton,
      secondary_button: secondaryButton,
      statistics,
    },
  } = await getDictionary(lang)
  console.timeEnd('getDictionary')

  console.time('getUserService')
  const {
    data: { user },
  } = await getUserService()
  console.timeEnd('getUserService')

  console.time('supabaseQuery')

  const username: string = user?.user_metadata.username
  const initial = username ? username[0].toUpperCase() : undefined

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
                <Button variant="outline" asChild>
                  {user ? (
                    <Link href={`/${lang}/app`}>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Avatar className="mr-2 h-6 w-6 border text-[10px]">
                              <AvatarFallback>{initial}</AvatarFallback>
                            </Avatar>
                          </TooltipTrigger>

                          <TooltipContent>{username}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      {primaryButton}
                    </Link>
                  ) : (
                    <Link href={`/${lang}/login`}>{primaryButton}</Link>
                  )}
                </Button>

                <Button asChild>
                  <Link href={`/${lang}/signup`}>{secondaryButton}</Link>
                </Button>
              </div>
            </div>
          </section>
        </div>

        <section className="space-y-8 p-4">
          <div className="mx-auto aspect-[9/16] w-full max-w-article overflow-y-auto rounded-md border bg-background shadow-lg dark:shadow-none md:aspect-[16/9]">
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
      </main>
    </>
  )
}
