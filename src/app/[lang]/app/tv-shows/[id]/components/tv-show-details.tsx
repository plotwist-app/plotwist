import { format } from 'date-fns'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import { Banner } from '@/components/banner'
import { Poster } from '@/components/poster'
import { Reviews } from '@/components/reviews'
import { Images } from '@/components/images'
import { Videos } from '@/components/videos'

import { WatchProviders } from '@/components/watch-providers'
import { ListsDropdown } from '@/components/lists'
import { Credits } from '@/components/credits'

import { TvShowSeasons } from './tv-show-seasons'
import { TvShowRelated } from './tv-show-related'

import { tmdbImage } from '@/utils/tmdb/image'

import { Language } from '@/types/languages'
import { TMDB } from '@/services/TMDB'
import { locale } from '@/utils/date/locale'
import { getDictionary } from '@/utils/dictionaries'

type TvShowsDetailsProps = {
  id: number
  language: Language
}

export const TvShowsDetails = async ({ id, language }: TvShowsDetailsProps) => {
  const tvShow = await TMDB.tvShows.details(id)
  const dictionary = await getDictionary(language)

  return (
    <div>
      <Banner url={tmdbImage(tvShow.backdrop_path)} />

      <div className="mx-auto my-8 max-w-4xl space-y-12 p-4">
        <main className="flex gap-4">
          <aside className="-mt-32 w-1/3 space-y-2">
            <Poster url={tmdbImage(tvShow.poster_path)} alt={tvShow.name} />
          </aside>

          <article className="flex w-2/3 flex-col gap-2">
            <span className="text-xs text-muted-foreground">
              {format(new Date(tvShow.first_air_date), 'PPP', {
                locale: locale[language],
              })}
            </span>

            <h1 className="text-4xl font-bold">{tvShow.name}</h1>

            <div className="flex items-center gap-2">
              <div className="flex items-center space-x-1">
                {tvShow.genres.map((genre) => {
                  return (
                    <Badge key={genre.id} variant="outline">
                      {genre.name}
                    </Badge>
                  )
                })}
              </div>

              <Separator orientation="vertical" className="h-6" />

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge>{tvShow.vote_average.toFixed(1)}</Badge>
                  </TooltipTrigger>

                  <TooltipContent>
                    <p>{tvShow.vote_count} votes</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <p className="text-sm text-muted-foreground">{tvShow.overview}</p>

            <div className="space-x-1">
              <WatchProviders id={tvShow.id} variant="tv" language={language} />
              <ListsDropdown item={tvShow} />
            </div>
          </article>
        </main>

        <Tabs defaultValue="reviews" className="w-full">
          <TabsList>
            <TabsTrigger value="reviews">{dictionary.tabs.reviews}</TabsTrigger>
            <TabsTrigger value="seasons">{dictionary.tabs.seasons}</TabsTrigger>
            <TabsTrigger value="credits">{dictionary.tabs.credits}</TabsTrigger>
            <TabsTrigger value="recommendations">
              {dictionary.tabs.recommendations}
            </TabsTrigger>
            <TabsTrigger value="similar">{dictionary.tabs.similar}</TabsTrigger>
            <TabsTrigger value="images">{dictionary.tabs.images}</TabsTrigger>
            <TabsTrigger value="videos">{dictionary.tabs.videos}</TabsTrigger>
          </TabsList>

          <TabsContent value="reviews" className="mt-4">
            <Reviews tmdbItem={tvShow} mediaType="TV_SHOW" />
          </TabsContent>

          <TabsContent value="seasons" className="mt-4">
            <TvShowSeasons seasons={tvShow.seasons} tvShowID={id} />
          </TabsContent>

          <TabsContent value="credits" className="mt-4">
            <Credits variant="tv" id={id} dictionary={dictionary} />
          </TabsContent>

          <TabsContent value="recommendations" className="mt-4">
            <TvShowRelated tvShowID={id} variant="recommendations" />
          </TabsContent>

          <TabsContent value="similar" className="mt-4">
            <TvShowRelated tvShowID={id} variant="similar" />
          </TabsContent>

          <TabsContent value="images" className="mt-4">
            <Images tmdbId={id} variant="tvShows" />
          </TabsContent>

          <TabsContent value="videos" className="mt-4">
            <Videos tmdbId={id} variant="tvShows" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
