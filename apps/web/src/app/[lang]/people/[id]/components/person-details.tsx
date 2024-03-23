import { format } from 'date-fns'

import { Banner } from '@/components/banner'
import { Images } from '@/components/images'
import { Poster } from '@/components/poster'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { locale } from '@/utils/date/locale'
import { getDictionary } from '@/utils/dictionaries'
import { tmdbImage } from '@/utils/tmdb/image'

import { PersonCredits } from './person-credits'
import { Container } from '@/app/[lang]/_components/container'
import { Language } from '@/types/languages'
import { tmdb } from '@plotwist/tmdb'

type PersonDetailsProps = { id: number; language: Language }

export const PersonDetails = async ({ id, language }: PersonDetailsProps) => {
  const person = await tmdb.person.details(id, language)

  const credits = await tmdb.person.combinedCredits(id, language)
  const mostPopularCredit = [...credits.cast, ...credits.crew]
    .sort((first, second) => first.vote_count - second.vote_count)
    .reverse()[0]

  const dictionary = await getDictionary(language)

  return (
    <Container>
      <Banner url={tmdbImage(mostPopularCredit.backdrop_path ?? '')} />

      <div className="mx-auto my-8 max-w-4xl space-y-8 p-4 md:space-y-12 ">
        <main className="flex flex-col gap-4 md:flex-row">
          <aside className="-mt-24 w-full space-y-2 md:-mt-32 md:w-1/3">
            <Poster alt={person.name} url={tmdbImage(person.profile_path)} />
          </aside>

          <article className="flex w-full flex-col gap-2 md:w-2/3">
            <span className="text-xs text-muted-foreground">
              {format(new Date(person.birthday), 'PPP', {
                locale: locale[language],
              })}

              {person.place_of_birth && `. ${person.place_of_birth}`}
            </span>

            <h1 className="text-4xl font-bold">{person.name}</h1>

            <div className="flex items-center gap-2">
              <div className="flex items-center space-x-1">
                <Badge variant="outline">{person.known_for_department}</Badge>
              </div>

              <Separator orientation="vertical" className="h-6" />

              <Badge>{(person.popularity / 10).toFixed(1)}</Badge>
            </div>

            <p className="text-xs leading-5 text-muted-foreground md:text-sm md:leading-6">
              {person.biography}
            </p>
          </article>
        </main>

        <Tabs defaultValue="credits" className="w-full">
          <TabsList>
            <TabsTrigger value="credits">{dictionary.tabs.credits}</TabsTrigger>
            <TabsTrigger value="images">{dictionary.tabs.images}</TabsTrigger>
          </TabsList>

          <TabsContent value="credits" className="mt-4">
            <PersonCredits personId={person.id} />
          </TabsContent>

          <TabsContent value="images" className="mt-4">
            <Images tmdbId={person.id} variant="person" />
          </TabsContent>
        </Tabs>
      </div>
    </Container>
  )
}
