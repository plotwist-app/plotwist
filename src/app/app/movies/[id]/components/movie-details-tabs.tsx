import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Reviews } from '@/app/app/components/reviews'

import { MovieCredits } from './movie-credits'
import { MovieRelated } from './movie-related'
import { MovieImages } from './movie-images'

type MovieDetailsTabsProps = { movieId: number }

export const MovieDetailsTabs = ({ movieId }: MovieDetailsTabsProps) => {
  return (
    <Tabs defaultValue="credits" className="w-full">
      <TabsList>
        <TabsTrigger value="reviews">Reviews</TabsTrigger>
        <TabsTrigger value="credits">Credits</TabsTrigger>
        <TabsTrigger value="images">Images</TabsTrigger>
        <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        <TabsTrigger value="similar">Similar</TabsTrigger>
      </TabsList>

      <TabsContent value="reviews" className="mt-4">
        <Reviews tmdbId={movieId} mediaType="MOVIE" />
      </TabsContent>

      <TabsContent value="credits" className="mt-4">
        <MovieCredits movieId={movieId} />
      </TabsContent>

      <TabsContent value="images" className="mt-4">
        <MovieImages movieId={movieId} />
      </TabsContent>

      <TabsContent value="recommendations" className="mt-4">
        <MovieRelated movieId={movieId} variant="recommendations" />
      </TabsContent>

      <TabsContent value="similar" className="mt-4">
        <MovieRelated movieId={movieId} variant="similar" />
      </TabsContent>
    </Tabs>
  )
}
