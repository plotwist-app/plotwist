import { Banner } from '@/app/app/components/banner'
import { Poster } from '@/app/app/components/poster'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TMDB } from '@/services/TMDB'
import { tmdbImage } from '@/utils/tmdb/image'

import { TvShowSeasons } from './tv-show-seasons'
import { TvShowCredits } from './tv-show-credits'
import { TvShowRelated } from './tv-show-related'
import { TvShowImages } from './tv-show-images'

type TvShowsDetailsProps = {
  id: number
}

export const TvShowsDetails = async ({ id }: TvShowsDetailsProps) => {
  const {
    name,
    backdrop_path: backdrop,
    poster_path: poster,
    seasons,
  } = await TMDB.tvShows.details(id)

  return (
    <div>
      <Banner url={tmdbImage(backdrop)} />

      <div className="mx-auto my-8 max-w-4xl space-y-12 p-4">
        <main className="flex gap-4">
          <aside className="-mt-32 w-1/3 space-y-2">
            <Poster url={tmdbImage(poster)} alt={name} />
          </aside>

          <div className="w-2/3"></div>
        </main>

        <Tabs defaultValue="seasons" className="w-full">
          <TabsList>
            <TabsTrigger value="reviews" disabled>
              Reviews
            </TabsTrigger>

            <TabsTrigger value="seasons">Seasons</TabsTrigger>
            <TabsTrigger value="credits">Credits</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="similar">Similar</TabsTrigger>
          </TabsList>

          <TabsContent value="reviews" className="mt-4"></TabsContent>

          <TabsContent value="seasons" className="mt-4">
            <TvShowSeasons seasons={seasons} tvShowID={id} />
          </TabsContent>

          <TabsContent value="credits" className="mt-4">
            <TvShowCredits tvShowID={id} />
          </TabsContent>

          <TabsContent value="images" className="mt-4">
            <TvShowImages tvShowID={id} />
          </TabsContent>

          <TabsContent value="recommendations" className="mt-4">
            <TvShowRelated tvShowID={id} variant="recommendations" />
          </TabsContent>

          <TabsContent value="similar" className="mt-4">
            <TvShowRelated tvShowID={id} variant="similar" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
