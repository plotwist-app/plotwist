import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Videos } from '@/app/app/components/videos'
import { Images } from '@/app/app/components/images'
import { Reviews } from '@/app/app/components/reviews'

import { MovieCredits } from './movie-credits'
import { MovieRelated } from './movie-related'
import { MovieDetails } from 'tmdb-ts'

type MovieDetailsTabsProps = { movie: MovieDetails }

export const MovieDetailsTabs = ({ movie }: MovieDetailsTabsProps) => {
  return (
    <Tabs defaultValue="reviews" className="w-full">
      <TabsList>
        <TabsTrigger value="reviews">Reviews</TabsTrigger>
        <TabsTrigger value="credits">Credits</TabsTrigger>
        <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        <TabsTrigger value="similar">Similar</TabsTrigger>
        <TabsTrigger value="images">Images</TabsTrigger>
        <TabsTrigger value="videos">Videos</TabsTrigger>
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
  )
}
