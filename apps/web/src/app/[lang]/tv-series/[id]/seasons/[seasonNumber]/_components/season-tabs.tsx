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
  id: number
}

export async function SeasonTabs({
  seasonDetails,
  language,
  id,
}: SeasonTabsProps) {
  const { episodes } = seasonDetails
  const dictionary = await getDictionary(language)

  return (
    <Tabs defaultValue="episodes" className="space-y-4">
      <div className="md:m-none -mx-4 max-w-[100vw] overflow-x-scroll px-4 scrollbar-hide">
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
      </div>

      <TabsContent value="episodes">
        <Suspense fallback={<div>Loading...</div>}>
          <SeasonEpisodes episodes={episodes} tvId={id} language={language} />
        </Suspense>
      </TabsContent>
    </Tabs>
  )
}
