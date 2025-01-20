import { tmdbImage } from '@/utils/tmdb/image'
import { Badge } from '@plotwist/ui/components/ui/badge'
import type { Episode } from '@plotwist_app/tmdb'
import Image from 'next/image'
import Link from 'next/link'

type SeasonEpisodesProps = {
  episodes: Episode[]
  tvId: number
}

export const SeasonEpisodes = ({ episodes, tvId }: SeasonEpisodesProps) => {
  return (
    <div className="space-y-4">
      {episodes.map(
        ({
          id,
          name,
          overview,
          still_path,
          episode_number,
          season_number,
          vote_average,
        }) => {
          const href = `/tv-series/${tvId}/seasons/${season_number}/episodes/${episode_number}`

          return (
            <div key={id} className="flex gap-4">
              <Link
                className="w-1/4 relative aspect-video rounded-lg overflow-hidden"
                href={href}
              >
                <Image
                  src={tmdbImage(still_path)}
                  alt={name}
                  fill
                  className="object-cover"
                />
              </Link>

              <div className="w-3/4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Link href={href}>
                    {episode_number}. {name}
                  </Link>

                  <Badge className="mr-2">
                    <Image
                      src="/assets/tmdb.svg"
                      width={55}
                      height={1}
                      alt="TMDB"
                      className="mr-2"
                    />

                    {vote_average.toFixed(1)}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground">{overview}</p>
              </div>
            </div>
          )
        }
      )}
    </div>
  )
}
