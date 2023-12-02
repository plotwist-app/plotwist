import Link from 'next/link'
import { MovieWithMediaType } from 'tmdb-ts'

type SidebarSearchMovieProps = {
  movie: MovieWithMediaType
}

export const SidebarSearchMovie = ({ movie }: SidebarSearchMovieProps) => {
  return (
    <Link
      href={`/app/movies/${movie.id}`}
      className="flex cursor-pointer items-center justify-between gap-4 rounded-sm px-2 py-1 hover:bg-muted"
    >
      <span className="text-md truncate whitespace-nowrap">{movie.title}</span>

      <span className="whitespace-nowrap text-xs text-muted-foreground">
        {new Date(movie.release_date).getFullYear()}
      </span>
    </Link>
  )
}
