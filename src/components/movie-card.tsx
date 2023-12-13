import Image from 'next/image'
import Link from 'next/link'
import { Movie, Recommendation } from 'tmdb-ts'

type MovieCardProps = {
  movie: Movie | Recommendation
}

export const MovieCard = ({ movie }: MovieCardProps) => {
  const { title, backdrop_path: backdrop, overview, id } = movie

  if (!backdrop) return <></>

  return (
    <Link
      href={`/app/movies/${id}`}
      className="w-full cursor-pointer space-y-2"
      data-testid="movie-card"
    >
      <div className="relative aspect-video w-full overflow-hidden rounded-md border bg-background/50 shadow">
        <Image
          fill
          className="object-cover"
          src={`https://image.tmdb.org/t/p/original/${backdrop}`}
          alt={title}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      <div>
        <span className="font-bold">{title}</span>
        <p className="line-clamp-2 text-xs text-muted-foreground">{overview}</p>
      </div>
    </Link>
  )
}
