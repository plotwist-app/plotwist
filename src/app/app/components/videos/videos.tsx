import { TMDB } from '@/services/TMDB'
import { Video } from 'tmdb-ts'

type VideosProps = {
  tmdbId: number
  variant: 'tvShows' | 'movies'
}

type VideoProps = {
  video: Video
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
      />
    </div>
  )
}

export const Videos = async ({ tmdbId, variant }: VideosProps) => {
  const { results } = await TMDB[variant].videos(tmdbId)

  console.log({ results })

  return (
    <div className="grid grid-cols-2 gap-4">
      {results.map((video) => (
        <Video key={video.id} video={video} />
      ))}
    </div>
  )
}
