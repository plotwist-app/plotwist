import Image from 'next/image'
import { Movie } from 'tmdb-ts'

type MovieCardProps = {
  movie: Movie
}

export const MovieCard = ({ movie }: MovieCardProps) => {
  const { title, poster_path: poster } = movie

  return (
    <div className="space-y-2">
      <div className="aspect-[2/3] w-full relative overflow-hidden rounded-sm">
        <Image
          fill
          className="object-cover"
          src={`https://image.tmdb.org/t/p/original/${poster}`}
          alt={title}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      <div className="">
        <span>{title}</span>
      </div>
    </div>
  )
}
