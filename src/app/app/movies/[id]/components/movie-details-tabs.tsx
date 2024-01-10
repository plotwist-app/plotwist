import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Videos } from '@/app/app/components/videos'
import { Images } from '@/app/app/components/images'
import { Reviews } from '@/app/app/components/reviews'

import { MovieCredits } from './movie-credits'
import { MovieRelated } from './movie-related'

type MovieDetailsTabsProps = { movieId: number }

export const MovieDetailsTabs = ({ movieId }: MovieDetailsTabsProps) => {
  return (
    <Tabs defaultValue="credits" className="w-full">
      <TabsList>
        <TabsTrigger value="reviews">Reviews</TabsTrigger>
        <TabsTrigger value="credits">Credits</TabsTrigger>
        <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        <TabsTrigger value="similar">Similar</TabsTrigger>
        <TabsTrigger value="images">Images</TabsTrigger>
        <TabsTrigger value="videos">Videos</TabsTrigger>
      </TabsList>

      <TabsContent value="reviews" className="mt-4">
        <Reviews tmdbId={movieId} mediaType="MOVIE" />
      </TabsContent>

      <TabsContent value="credits" className="mt-4">
        <MovieCredits movieId={movieId} />
      </TabsContent>

      <TabsContent value="recommendations" className="mt-4">
        <MovieRelated movieId={movieId} variant="recommendations" />
      </TabsContent>

      <TabsContent value="similar" className="mt-4">
        <MovieRelated movieId={movieId} variant="similar" />
      </TabsContent>

      <TabsContent value="images" className="mt-4">
        <Images tmdbId={movieId} variant="movies" />
      </TabsContent>

      <TabsContent value="videos" className="mt-4">
        <Videos tmdbId={movieId} variant="movies" />
      </TabsContent>
    </Tabs>
  )
}
