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

type EpisodeTabsProps = {
  language: Language
}

export async function EpisodeTabs({ language }: EpisodeTabsProps) {
  const dictionary = await getDictionary(language)

  return (
    <Tabs defaultValue="reviews" className="space-y-4">
      <TabsList>
        <TabsTrigger value="reviews">{dictionary.reviews}</TabsTrigger>
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

      <TabsContent value="reviews">
        <Suspense fallback={<div>Loading...</div>}>
          <EpisodeReviews />
        </Suspense>
      </TabsContent>
    </Tabs>
  )
}
