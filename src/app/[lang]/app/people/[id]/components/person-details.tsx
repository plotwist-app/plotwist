import { Banner } from '@/components/banner'
import { Images } from '@/components/images'
import { Poster } from '@/components/poster'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { tmdb } from '@/services/tmdb'
import { Language } from '@/types/languages'
import { locale } from '@/utils/date/locale'
import { getDictionary } from '@/utils/dictionaries'
import { tmdbImage } from '@/utils/tmdb/image'
import { format } from 'date-fns'
import { PersonCredits } from './person-credits'

type PersonDetailsProps = { id: number; language: Language }

export const PersonDetails = async ({ id, language }: PersonDetailsProps) => {
  const person = await tmdb.person.details(id, language)

  const credits = await tmdb.person.combinedCredits(id, language)
  const mostPopularCredit = [...credits.cast, ...credits.crew]
    .sort((first, second) => first.vote_count - second.vote_count)
    .reverse()[0]

  const dictionary = await getDictionary(language)

  return (
    <div>
      <Banner url={tmdbImage(mostPopularCredit.backdrop_path ?? '')} />

      <div className="mx-auto my-8 max-w-4xl space-y-12 p-4">
        <main className="flex gap-4">
          <aside className="-mt-32 w-1/3 space-y-2">
            <Poster alt={person.name} url={tmdbImage(person.profile_path)} />
          </aside>

          <article className="flex w-2/3 flex-col gap-2">
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

            <p className="line-clamp-5 text-xs text-muted-foreground">
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
    </div>
  )
}
