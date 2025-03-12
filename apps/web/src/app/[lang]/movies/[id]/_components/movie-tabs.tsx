import { Credits } from '@/components/credits'
import { Images } from '@/components/images'
import { Reviews } from '@/components/reviews'
import { Videos } from '@/components/videos'
import { WhereToWatch } from '@/components/where-to-watch'
import type { Language, MovieDetails } from '@/services/tmdb'
import { getDictionary } from '@/utils/dictionaries'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@plotwist/ui/components/ui/tabs'
import { Suspense } from 'react'
import { MovieRelated } from './movie-related'

type MovieTabsProps = { language: Language; movie: MovieDetails }

export const MovieTabs = async ({ language, movie }: MovieTabsProps) => {
  const dictionary = await getDictionary(language)

  return (
    <Tabs defaultValue="reviews" className="w-full p-4 lg:p-0">
      <div className="md:m-none p-none -mx-4 max-w-[100vw] overflow-x-scroll px-4 scrollbar-hide">
        <TabsList>
          <TabsTrigger value="reviews">{dictionary.tabs.reviews}</TabsTrigger>
          <TabsTrigger value="where_to_watch">
            {dictionary.where_to_watch}
          </TabsTrigger>
          <TabsTrigger value="credits">{dictionary.tabs.credits}</TabsTrigger>
          <TabsTrigger value="recommendations">
            {dictionary.tabs.recommendations}
          </TabsTrigger>
          <TabsTrigger value="similar">{dictionary.tabs.similar}</TabsTrigger>
          <TabsTrigger value="images">{dictionary.tabs.images}</TabsTrigger>
          <TabsTrigger value="videos">{dictionary.tabs.videos}</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="reviews" className="mt-4">
        <Reviews tmdbId={movie.id} mediaType="MOVIE" />
      </TabsContent>

      <TabsContent value="where_to_watch" className="mt-4">
        <Suspense>
          <WhereToWatch id={movie.id} variant="movie" language={language} />
        </Suspense>
      </TabsContent>

      <TabsContent value="credits" className="mt-4">
        <Suspense>
          <Credits variant="movie" id={movie.id} language={language} />
        </Suspense>
      </TabsContent>

      <TabsContent value="recommendations" className="mt-4">
        <Suspense>
          <MovieRelated
            movieId={movie.id}
            variant="recommendations"
            language={language}
          />
        </Suspense>
      </TabsContent>

      <TabsContent value="similar" className="mt-4">
        <Suspense>
          <MovieRelated
            movieId={movie.id}
            variant="similar"
            language={language}
          />
        </Suspense>
      </TabsContent>

      <TabsContent value="images" className="mt-4">
        <Suspense>
          <Images tmdbId={movie.id} variant="movie" dictionary={dictionary} />
        </Suspense>
      </TabsContent>

      <TabsContent value="videos" className="mt-4">
        <Suspense>
          <Videos tmdbId={movie.id} variant="movie" dictionary={dictionary} />
        </Suspense>
      </TabsContent>
    </Tabs>
  )
}
