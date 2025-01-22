import { type Video as VideoType, tmdb } from '@/services/tmdb'
import type { Dictionary } from '@/utils/dictionaries'

type BaseVideosProps = {
  tmdbId: number
  dictionary: Dictionary
}

type DefaultVideosProps = BaseVideosProps & {
  variant: 'tv' | 'movie'
}

type SeasonVideosProps = BaseVideosProps & {
  variant: 'season'
  seasonNumber: number
}

export type VideosProps = DefaultVideosProps | SeasonVideosProps

type VideoProps = {
  video: VideoType
}

const Video = ({ video }: VideoProps) => {
  const videoUrlBySite: Record<string, string> = {
    YouTube: `https://www.youtube.com/embed/${video.key}?rel=0&modestbranding=1&autohide=1&showinfo=0`,
    Vimeo: `https://player.vimeo.com/video/${video.key}`,
  }

  return (
    <div className="aspect-video w-full overflow-hidden rounded-md border bg-muted">
      <iframe
        src={videoUrlBySite[video.site]}
        className="h-full w-full"
        allowFullScreen
        title={video.name}
      />
    </div>
  )
}

function getVideos(props: VideosProps) {
  const { variant, tmdbId } = props

  if (variant === 'season') {
    const { seasonNumber } = props
    return tmdb.season.videos(tmdbId, seasonNumber)
  }

  return tmdb.videos(variant, tmdbId)
}

export const Videos = async (props: VideosProps) => {
  const { results } = await getVideos(props)
  const { dictionary } = props

  if (results.length === 0)
    return (
      <div className="flex items-center justify-center border border-dashed p-8 text-muted-foreground rounded-lg text-sm">
        {dictionary.no_videos_found}
      </div>
    )

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {results.map(video => (
        <Video key={video.id} video={video} />
      ))}
    </div>
  )
}
