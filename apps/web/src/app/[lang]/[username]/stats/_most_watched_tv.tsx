import { Poster } from '@/components/poster'
import { PosterCard } from '@/components/poster-card'
import { tmdb } from '@/services/tmdb'
import { tmdbImage } from '@/utils/tmdb/image'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@plotwist/ui/components/ui/card'
import { Trophy } from 'lucide-react'

export async function MostWatchedTv() {
  const { results } = await tmdb.tv.list({
    list: 'top_rated',
    language: 'en-US',
    page: 1,
  })

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Séries mais assistidas
        </CardTitle>
        <Trophy className="size-4 text-muted-foreground" />
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-3 gap-1.5">
          {results.slice(0, 3).map(result => (
            <div className="space-y-2" key={result.id}>
              <PosterCard.Root>
                <PosterCard.Image
                  src={tmdbImage(result.poster_path, 'w500')}
                  alt={result.name}
                />

                <p className="text-xs text-muted-foreground text-center">
                  123 episódios
                </p>
              </PosterCard.Root>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
