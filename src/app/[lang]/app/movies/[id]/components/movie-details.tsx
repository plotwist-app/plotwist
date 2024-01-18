import { tmdbImage } from '@/utils/tmdb/image'

import { tmdb } from '@/services/tmdb2'

import { MovieCredits } from './movie-credits'
import { MovieRelated } from './movie-related'
import { MovieCollection } from './movie-collection'
import { MovieDetailsInfo } from './movie-details-info'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { Reviews } from '@/components/reviews'
import { Videos } from '@/components/videos'
import { Images } from '@/components/images'
import { Banner } from '@/components/banner'
import { Poster } from '@/components/poster'

import { Language } from '@/types/languages'
import { getDictionary } from '@/utils/dictionaries'

type MovieDetailsProps = {
  id: number
  language: Language
}

export const MovieDetails = async ({ id, language }: MovieDetailsProps) => {
  const movie = await tmdb.movies.details(id, language)
  const { tabs } = await getDictionary(language)

  return (
    <div>
      <Banner url={tmdbImage(movie.backdrop_path)} />

      <div className="mx-auto my-8 max-w-4xl space-y-12 p-4">
        <main className="flex gap-4">
          <aside className="-mt-32 w-1/3 space-y-2">
            <Poster
              url={tmdbImage(movie.poster_path ?? '')}
              alt={movie.title}
            />
          </aside>

          <MovieDetailsInfo movie={movie} />
        </main>

        {movie.belongs_to_collection && (
          <MovieCollection collectionId={movie.belongs_to_collection.id} />
        )}

        <Tabs defaultValue="reviews" className="w-full">
          <TabsList>
            <TabsTrigger value="reviews">{tabs.reviews}</TabsTrigger>
            <TabsTrigger value="credits">{tabs.credits}</TabsTrigger>
            <TabsTrigger value="recommendations">
              {tabs.recommendations}
            </TabsTrigger>
            <TabsTrigger value="similar">{tabs.similar}</TabsTrigger>
            <TabsTrigger value="images">{tabs.images}</TabsTrigger>
            <TabsTrigger value="videos">{tabs.videos}</TabsTrigger>
          </TabsList>

          <TabsContent value="reviews" className="mt-4">
            <Reviews tmdbItem={movie} mediaType="MOVIE" />
          </TabsContent>

          <TabsContent value="credits" className="mt-4">
            <MovieCredits movieId={movie.id} />
          </TabsContent>

          <TabsContent value="recommendations" className="mt-4">
            <MovieRelated movieId={movie.id} variant="recommendations" />
          </TabsContent>

          <TabsContent value="similar" className="mt-4">
            <MovieRelated movieId={movie.id} variant="similar" />
          </TabsContent>

          <TabsContent value="images" className="mt-4">
            <Images tmdbId={movie.id} variant="movies" />
          </TabsContent>

          <TabsContent value="videos" className="mt-4">
            <Videos tmdbId={movie.id} variant="movies" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
