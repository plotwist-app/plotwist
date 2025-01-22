import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@plotwist/ui/components/ui/tabs'
import type { Language } from '@/types/languages'
import { getDictionary } from '@/utils/dictionaries'
import { Suspense } from 'react'
import { EpisodeReviews } from './episode-reviews'
import { Credits } from '@/components/credits/credits'

type EpisodeTabsProps = {
  language: Language
  id: number
  seasonNumber: number
  episodeNumber: number
}

export async function EpisodeTabs({
  language,
  id,
  seasonNumber,
  episodeNumber,
}: EpisodeTabsProps) {
  const dictionary = await getDictionary(language)

  return (
    <Tabs defaultValue="reviews" className="space-y-4">
      <TabsList>
        <TabsTrigger value="reviews">{dictionary.reviews}</TabsTrigger>
        <TabsTrigger value="credits">{dictionary.tabs.credits}</TabsTrigger>
        <TabsTrigger value="videos" disabled>
          {dictionary.tabs.videos}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="reviews">
        <Suspense fallback={<div>Loading...</div>}>
          <EpisodeReviews />
        </Suspense>
      </TabsContent>

      <TabsContent value="credits">
        <Credits
          variant="episode"
          id={id}
          language={language}
          seasonNumber={seasonNumber}
          episodeNumber={episodeNumber}
        />
      </TabsContent>
    </Tabs>
  )
}
