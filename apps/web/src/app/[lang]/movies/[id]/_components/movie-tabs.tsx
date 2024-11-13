import { Credits } from '@/components/credits'
import { Reviews } from '@/components/reviews'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@plotwist/ui/components/ui/tabs'
import { getDictionary } from '@/utils/dictionaries'
import { Language, MovieDetails } from '@/services/tmdb'
import { MovieRelated } from './movie-related'
import { Images } from '@/components/images'
import { Videos } from '@/components/videos'
import { WhereToWatch } from '@/components/where-to-watch'

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

      <TabsContent value="where_to_watch" className="mt-4">
        <WhereToWatch id={movie.id} variant="movie" language={language} />
      </TabsContent>

      <TabsContent value="reviews" className="mt-4">
        <Reviews tmdbItem={movie} mediaType="MOVIE" />
      </TabsContent>

      <TabsContent value="credits" className="mt-4">
        <Credits variant="movie" id={movie.id} language={language} />
      </TabsContent>

      <TabsContent value="recommendations" className="mt-4">
        <MovieRelated
          movieId={movie.id}
          variant="recommendations"
          language={language}
        />
      </TabsContent>

      <TabsContent value="similar" className="mt-4">
        <MovieRelated
          movieId={movie.id}
          variant="similar"
          language={language}
        />
      </TabsContent>

      <TabsContent value="images" className="mt-4">
        <Images tmdbId={movie.id} variant="movie" />
      </TabsContent>

      <TabsContent value="videos" className="mt-4">
        <Videos tmdbId={movie.id} variant="movie" />
      </TabsContent>
    </Tabs>
  )
}
