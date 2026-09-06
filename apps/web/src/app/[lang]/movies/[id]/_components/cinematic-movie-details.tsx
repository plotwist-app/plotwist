import { format } from 'date-fns'
import { Instrument_Sans } from 'next/font/google'
import { type CSSProperties, Suspense } from 'react'
import { Banner } from '@/components/banner'
import { Poster } from '@/components/poster'
import type { Language, MovieDetails } from '@/services/tmdb'
import { locale } from '@/utils/date/locale'
import { MovieActions } from './movie-actions'
import { MovieCollection } from './movie-collection'
import { MovieGenres } from './movie-genres'
import { MovieRating } from './movie-rating'
import { MovieTabs } from './movie-tabs'

const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  display: 'swap',
})

const cinematicTheme = {
  '--background': '48 10% 4%',
  '--foreground': '43 38% 94%',
  '--card': '40 7% 8%',
  '--card-foreground': '43 38% 94%',
  '--popover': '40 7% 8%',
  '--popover-foreground': '43 38% 94%',
  '--primary': '4 100% 68%',
  '--primary-foreground': '48 10% 4%',
  '--secondary': '40 7% 12%',
  '--secondary-foreground': '43 38% 94%',
  '--muted': '40 7% 12%',
  '--muted-foreground': '43 18% 70%',
  '--accent': '40 7% 16%',
  '--accent-foreground': '43 38% 94%',
  '--border': '43 18% 22%',
  '--input': '43 18% 22%',
  '--ring': '4 100% 68%',
  '--cinematic-background': '#0b0b09',
  '--cinematic-foreground': '#f7f3ea',
  '--cinematic-muted': 'rgba(247, 243, 234, 0.66)',
  '--cinematic-accent': '#ff645a',
  colorScheme: 'dark',
} as CSSProperties

type CinematicMovieDetailsProps = {
  movie: MovieDetails
  language: Language
  backdropUrl?: string
  posterUrl?: string
}

export const CinematicMovieDetails = ({
  movie,
  language,
  backdropUrl,
  posterUrl,
}: CinematicMovieDetailsProps) => (
  <div
    className={`${instrumentSans.className} min-h-screen w-full overflow-hidden bg-[var(--cinematic-background)] text-[var(--cinematic-foreground)]`}
    data-testid="cinematic-movie-details"
    style={cinematicTheme}
  >
    <div className="relative h-[46vh] min-h-[340px] max-h-[620px] w-full">
      <Banner
        url={backdropUrl}
        posterUrl={posterUrl}
        title={movie.title}
        className="absolute inset-0 h-full max-h-none w-full rounded-none border-0 md:rounded-none lg:border-0"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-black/35 to-[var(--cinematic-background)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,transparent_0%,rgba(11,11,9,0.68)_100%)]" />
    </div>

    <section className="relative z-10 mx-auto -mt-28 max-w-6xl px-5 pb-16 sm:-mt-36 sm:px-8 lg:-mt-44">
      <div className="grid grid-cols-1 items-end gap-x-5 gap-y-6 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-x-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-x-12">
        <aside className="w-32 self-end sm:w-auto lg:row-span-2">
          <Poster
            url={movie.poster_path}
            alt={movie.title}
            className="rounded-xl border-white/15 bg-[#161513] shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
          />
        </aside>

        <article className="min-w-0 self-end pb-1 sm:pb-3">
          {movie.release_date && (
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--cinematic-accent)] sm:text-xs">
              {format(new Date(movie.release_date), 'PPP', {
                locale: locale[language],
              })}
            </p>
          )}

          <h1 className="text-balance text-2xl font-semibold leading-[0.98] tracking-[-0.04em] [overflow-wrap:anywhere] sm:text-4xl lg:text-6xl">
            {movie.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <MovieGenres
              genres={movie.genres}
              className="max-w-full whitespace-normal break-words text-left"
            />
            <MovieRating
              movie={movie}
              className="border-white/15 bg-white/10 text-[var(--cinematic-foreground)] hover:bg-white/15"
            />
          </div>
        </article>

        <div className="col-span-1 space-y-5 sm:col-span-2 lg:col-start-2">
          <p className="max-w-3xl text-sm leading-7 text-[var(--cinematic-muted)] sm:text-base sm:leading-8">
            {movie.overview}
          </p>

          <MovieActions
            movie={movie}
            language={language}
            className="gap-2.5 [&_button]:min-h-11 [&_button]:min-w-11"
          />
        </div>
      </div>
    </section>

    <section className="mx-auto max-w-5xl space-y-8 px-0 pb-16 sm:px-6">
      {movie.belongs_to_collection && (
        <Suspense>
          <MovieCollection
            collectionId={movie.belongs_to_collection.id}
            language={language}
          />
        </Suspense>
      )}

      <Suspense>
        <MovieTabs movie={movie} language={language} />
      </Suspense>
    </section>
  </div>
)
