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
import { Suspense } from 'react'

type SeasonTabsProps = {
  seasonDetails: SeasonDetails
  language: Language
}

export async function SeasonTabs({ seasonDetails, language }: SeasonTabsProps) {
  const { episodes, id } = seasonDetails
  const dictionary = await getDictionary(language)

  return (
    <Tabs defaultValue="episodes" className="space-y-4">
      <TabsList>
        <TabsTrigger value="reviews" disabled>
          {dictionary.reviews}
        </TabsTrigger>
        <TabsTrigger value="episodes">{dictionary.episodes}</TabsTrigger>
        <TabsTrigger value="credits" disabled>
          {dictionary.tabs.credits}
        </TabsTrigger>
        <TabsTrigger value="images" disabled>
          {dictionary.tabs.images}
        </TabsTrigger>
        <TabsTrigger value="videos" disabled>
          {dictionary.tabs.videos}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="episodes">
        <Suspense fallback={<div>Loading...</div>}>
          <SeasonEpisodes episodes={episodes} tvId={id} />
        </Suspense>
      </TabsContent>
    </Tabs>
  )
}
