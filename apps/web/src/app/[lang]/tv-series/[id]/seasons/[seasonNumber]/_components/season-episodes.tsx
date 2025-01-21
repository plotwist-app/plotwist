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
  const filteredEpisodes = episodes.filter(episode => episode.runtime !== null)

  return (
    <div className="space-y-6">
      {filteredEpisodes.map(
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
            <div key={id} className="flex gap-2 flex-col md:flex-row md:gap-4">
              <div className="w-auto md:w-[200px]">
                <Link
                  className="block relative aspect-video rounded-md overflow-hidden shadow border"
                  href={href}
                >
                  <Image
                    src={tmdbImage(still_path)}
                    alt={name}
                    fill
                    className="object-cover"
                  />
                </Link>
              </div>

              <div className="space-y-2 flex-1">
                <Link href={href}>
                  {episode_number}. {name}
                </Link>

                <p className="text-xs text-muted-foreground line-clamp-3">
                  {overview}
                </p>

                <div>
                  <Badge>
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
              </div>
            </div>
          )
        }
      )}
    </div>
  )
}
