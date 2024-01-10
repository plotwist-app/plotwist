import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Reviews } from '@/app/app/components/reviews'

import { MovieCredits } from './movie-credits'
import { MovieRelated } from './movie-related'
import { MovieImages } from './movie-images'
import { MovieDetails } from 'tmdb-ts'

type MovieDetailsTabsProps = { movie: MovieDetails }

export const MovieDetailsTabs = ({ movie }: MovieDetailsTabsProps) => {
  return (
    <Tabs defaultValue="reviews" className="w-full">
      <TabsList>
        <TabsTrigger value="reviews">Reviews</TabsTrigger>
        <TabsTrigger value="credits">Credits</TabsTrigger>
        <TabsTrigger value="images">Images</TabsTrigger>
        <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        <TabsTrigger value="similar">Similar</TabsTrigger>
      </TabsList>

      <TabsContent value="reviews" className="mt-4">
        <Reviews tmdbItem={movie} mediaType="MOVIE" />
      </TabsContent>

      <TabsContent value="credits" className="mt-4">
        <MovieCredits movieId={movie.id} />
      </TabsContent>

      <TabsContent value="images" className="mt-4">
        <MovieImages movieId={movie.id} />
      </TabsContent>

      <TabsContent value="recommendations" className="mt-4">
        <MovieRelated movieId={movie.id} variant="recommendations" />
      </TabsContent>

      <TabsContent value="similar" className="mt-4">
        <MovieRelated movieId={movie.id} variant="similar" />
      </TabsContent>
    </Tabs>
  )
}
