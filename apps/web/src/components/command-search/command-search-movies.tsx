import { useLanguage } from '@/context/language'
import { MovieWithMediaType } from '@plotwist/tmdb'
import Link from 'next/link'
import { PosterCard } from '../poster-card'
import { tmdbImage } from '@/utils/tmdb/image'
import { classnames } from './command-search'
import { ScrollArea } from '../ui/scroll-area'

type CommandSearchMoviesProps = {
  movies: MovieWithMediaType[]
  isLoading?: boolean
}

export const CommandSearchMovies = ({
  movies,
  isLoading,
}: CommandSearchMoviesProps) => {
  const { language } = useLanguage()

  if (isLoading) {
    return (
      <ScrollArea className={classnames.scrollArea}>
        <div className={classnames.list}>
          {Array.from({ length: 20 }).map((_, index) => (
            <PosterCard.Skeleton key={index} />
          ))}
        </div>
      </ScrollArea>
    )
  }

  if (!movies || movies.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm">
        <p>Não encontramos nenhum resultado.</p>
      </div>
    )
  }

  return (
    <ScrollArea className={classnames.scrollArea}>
      <div className={classnames.list}>
        {movies.map((movie) => (
          <Link href={`/${language}/movies/${movie.id}`} key={movie.id}>
            <PosterCard.Root>
              <PosterCard.Image
                src={tmdbImage(movie.poster_path, 'w500')}
                alt={movie.title}
              />

              <PosterCard.Details>
                <PosterCard.Title>{movie.title}</PosterCard.Title>
                <PosterCard.Year>
                  {movie.release_date.split('-')[0]}
                </PosterCard.Year>
              </PosterCard.Details>
            </PosterCard.Root>
          </Link>
        ))}
      </div>
    </ScrollArea>
  )
}
