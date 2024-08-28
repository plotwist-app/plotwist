import { Language } from '@/types/languages'
import { tmdbImage } from '@/utils/tmdb/image'
import { tmdb } from '@plotwist/tmdb'
import Image from 'next/image'
import Link from 'next/link'
import { twMerge } from 'tailwind-merge'

type TopMoviesProps = { language: Language }

export const TopMovies = async ({ language }: TopMoviesProps) => {
  const { results } = await tmdb.movies.list({
    list: 'popular',
    page: 1,
    language,
  })

  return (
    <div className="mx-auto mb-64 grid max-w-6xl grid-cols-3">
      {results.slice(0, 3).map((movie) => {
        return (
          <Link
            className={twMerge(
              'overflow-hidden rounded-[5%] transition-all',

              'first:translate-x-[60px] first:translate-y-[30px] first:rotate-[-10deg] lg:first:translate-x-[120px] lg:first:translate-y-[75px] lg:first:rotate-[-10deg]',

              'last:translate-x-[-60px] last:translate-y-[30px] last:rotate-[10deg] lg:last:translate-x-[-120px] lg:last:translate-y-[75px] lg:last:rotate-[10deg]',

              '[&:nth-child(2)]:z-40',
            )}
            href={`/${language}/movies/${movie.id}`}
            key={movie.id}
          >
            <div className="relative aspect-poster rounded-3xl">
              <Image
                src={tmdbImage(movie.poster_path, 'original')}
                fill
                quality={100}
                alt={movie.title}
              />
            </div>
          </Link>
        )
      })}
    </div>
  )
}
