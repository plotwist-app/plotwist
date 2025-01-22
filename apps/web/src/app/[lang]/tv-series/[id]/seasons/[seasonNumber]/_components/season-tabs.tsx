import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@plotwist/ui/components/ui/tabs'
import { SeasonEpisodes } from './season-episodes'
import type { SeasonDetails } from '@plotwist_app/tmdb'
import type { Language } from '@/types/languages'
import { getDictionary } from '@/utils/dictionaries'
import { Credits } from '@/components/credits'
import { Suspense } from 'react'
import { Images } from '@/components/images'
import { Videos } from '@/components/videos'

type SeasonTabsProps = {
  seasonDetails: SeasonDetails
  language: Language
  id: number
}

export async function SeasonTabs({
  seasonDetails,
  language,
  id,
}: SeasonTabsProps) {
  const { episodes, season_number } = seasonDetails
  const dictionary = await getDictionary(language)

  return (
    <Tabs defaultValue="episodes" className="space-y-4">
      <div className="md:m-none -mx-4 max-w-[100vw] overflow-x-scroll px-4 scrollbar-hide">
        <TabsList>
          <TabsTrigger value="reviews" disabled>
            {dictionary.reviews}
          </TabsTrigger>
          <TabsTrigger value="episodes">{dictionary.episodes}</TabsTrigger>
          <TabsTrigger value="credits">{dictionary.tabs.credits}</TabsTrigger>
          <TabsTrigger value="images">{dictionary.tabs.images}</TabsTrigger>
          <TabsTrigger value="videos">{dictionary.tabs.videos}</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="episodes">
        <SeasonEpisodes episodes={episodes} tvId={id} language={language} />
      </TabsContent>

      <TabsContent value="credits">
        <Credits
          variant="season"
          id={id}
          language={language}
          seasonNumber={season_number}
        />
      </TabsContent>

      <TabsContent value="images">
        <Images variant="season" tmdbId={id} seasonNumber={season_number} />
      </TabsContent>

      <TabsContent value="videos">
        <Suspense>
          <Videos
            variant="season"
            tmdbId={id}
            seasonNumber={season_number}
            dictionary={dictionary}
          />
        </Suspense>
      </TabsContent>
    </Tabs>
  )
}
