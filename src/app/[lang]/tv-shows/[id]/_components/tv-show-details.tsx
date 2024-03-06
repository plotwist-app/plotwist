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

import { tmdb } from '@/services/tmdb'

import { tmdbImage } from '@/utils/tmdb/image'
import { locale } from '@/utils/date/locale'
import { getDictionary } from '@/utils/dictionaries'

import { Language } from '@/types/languages'

type TvShowsDetailsProps = {
  id: number
  language: Language
}

export const TvShowsDetails = async ({ id, language }: TvShowsDetailsProps) => {
  const tvShow = await tmdb.tvSeries.details(id, language)
  const dictionary = await getDictionary(language)

  return (
    <div className="mx-auto max-w-6xl">
      <Banner url={tmdbImage(tvShow.backdrop_path)} />

      <div className="mx-auto my-8 max-w-4xl space-y-8 md:space-y-12">
        <main className="flex flex-col gap-4 md:flex-row">
          <aside className="-mt-24 w-full space-y-2 md:-mt-32 md:w-1/3">
            <Poster url={tmdbImage(tvShow.poster_path)} alt={tvShow.name} />
          </aside>

          <article className="flex w-full flex-col gap-2 md:w-2/3">
            {tvShow.first_air_date && (
              <span className="text-xs text-muted-foreground">
                {format(new Date(tvShow.first_air_date), 'PPP', {
                  locale: locale[language],
                })}
              </span>
            )}

            <h1 className="text-4xl font-bold">{tvShow.name}</h1>

            <div className="flex flex-wrap items-center gap-1.5">
              {tvShow.genres.map((genre) => {
                return (
                  <Badge
                    key={genre.id}
                    variant="outline"
                    className="whitespace-nowrap"
                  >
                    {genre.name}
                  </Badge>
                )
              })}

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

            <p className="text-xs leading-5 text-muted-foreground md:text-sm md:leading-6">
              {tvShow.overview}
            </p>

            <div className="space-x-1">
              <WatchProviders id={tvShow.id} variant="tv" language={language} />
              <ListsDropdown item={tvShow} />
            </div>
          </article>
        </main>

        <Tabs defaultValue="reviews" className="w-full">
          <div className="md:m-none p-none -mx-4 max-w-[100vw] overflow-x-scroll px-4 scrollbar-hide">
            <TabsList>
              <TabsTrigger value="reviews">
                {dictionary.tabs.reviews}
              </TabsTrigger>
              <TabsTrigger value="seasons">
                {dictionary.tabs.seasons}
              </TabsTrigger>
              <TabsTrigger value="credits">
                {dictionary.tabs.credits}
              </TabsTrigger>
              <TabsTrigger value="recommendations">
                {dictionary.tabs.recommendations}
              </TabsTrigger>
              <TabsTrigger value="similar">
                {dictionary.tabs.similar}
              </TabsTrigger>
              <TabsTrigger value="images">{dictionary.tabs.images}</TabsTrigger>
              <TabsTrigger value="videos">{dictionary.tabs.videos}</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="reviews" className="mt-4">
            <Reviews tmdbItem={tvShow} mediaType="TV_SHOW" />
          </TabsContent>

          <TabsContent value="seasons" className="mt-4">
            <TvShowSeasons
              seasons={tvShow.seasons}
              id={id}
              language={language}
            />
          </TabsContent>

          <TabsContent value="credits" className="mt-4">
            <Credits variant="tv" id={id} language={language} />
          </TabsContent>

          <TabsContent value="recommendations" className="mt-4">
            <TvShowRelated
              id={id}
              variant="recommendations"
              language={language}
            />
          </TabsContent>

          <TabsContent value="similar" className="mt-4">
            <TvShowRelated id={id} variant="similar" language={language} />
          </TabsContent>

          <TabsContent value="images" className="mt-4">
            <Images tmdbId={id} variant="tv" />
          </TabsContent>

          <TabsContent value="videos" className="mt-4">
            <Videos tmdbId={id} variant="tv" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
