import { Credits } from '@/components/credits'
import { Images } from '@/components/images'
import { Reviews } from '@/components/reviews'
import { Videos } from '@/components/videos'
import type { Language } from '@/types/languages'
import { getDictionary } from '@/utils/dictionaries'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@plotwist/ui/components/ui/tabs'
import type { SeasonDetails } from '@plotwist_app/tmdb'
import { Suspense } from 'react'
import { SeasonEpisodes } from './season-episodes'

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
    <Tabs defaultValue="reviews" className="space-y-4">
      <div className="md:m-none -mx-4 max-w-[100vw] overflow-x-scroll px-4 scrollbar-hide">
        <TabsList>
          <TabsTrigger value="reviews">{dictionary.reviews}</TabsTrigger>
          <TabsTrigger value="episodes">{dictionary.episodes}</TabsTrigger>
          <TabsTrigger value="credits">{dictionary.tabs.credits}</TabsTrigger>
          <TabsTrigger value="images">{dictionary.tabs.images}</TabsTrigger>
          <TabsTrigger value="videos">{dictionary.tabs.videos}</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="reviews">
        <Reviews mediaType="TV_SHOW" tmdbId={id} seasonNumber={season_number} />
      </TabsContent>

      <TabsContent value="episodes">
        <SeasonEpisodes episodes={episodes} tvId={id} />
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
        <Images
          variant="season"
          tmdbId={id}
          seasonNumber={season_number}
          dictionary={dictionary}
        />
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
