import { useQuery } from '@tanstack/react-query'
import { CheckCircle } from 'lucide-react'
import Image from 'next/image'
import { tmdb } from '@/services/tmdb'
import type { Language } from '@/types/languages'
import { tmdbImage } from '@/utils/tmdb/image'
import { type ContentType, useOnboarding } from '../onboarding-context'

export function OnboardingContentTypes({ lang }: { lang: string }) {
  const { contentTypes, setContentTypes, nextStep, dictionary } =
    useOnboarding()
  const language = (lang as Language) || 'en-US'

  const title = dictionary?.content_types_title || 'What do you like to watch?'
  const cta = dictionary?.continue || 'Continue'

  const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
    movie: dictionary?.content_types_movie || 'Movies',
    tv: dictionary?.content_types_tv || 'TV Series',
    anime: dictionary?.content_types_anime || 'Anime',
    dorama: dictionary?.content_types_dorama || 'K-Drama',
  }

  const { data: backdrops } = useQuery({
    queryKey: ['onboarding-content-type-backdrops', language],
    queryFn: async () => {
      const [movies, tvs, animes, doramas] = await Promise.all([
        tmdb.movies.discover({
          filters: { sort_by: 'vote_count.desc' },
          language,
          page: 1,
        }),
        tmdb.tv.discover({
          filters: { sort_by: 'vote_count.desc' },
          language,
          page: 1,
        }),

        tmdb.tv.discover({
          filters: {
            sort_by: 'vote_count.desc',
            with_original_language: 'ja',
            with_genres: '16',
          } as any,
          language,
          page: 1,
        }),

        tmdb.tv.discover({
          filters: {
            sort_by: 'vote_count.desc',
            with_original_language: 'ko',
          } as any,
          language,
          page: 1,
        }),
      ])

      return {
        movie: movies.results[0]?.backdrop_path,
        tv: tvs.results[0]?.backdrop_path,
        anime: animes.results[0]?.backdrop_path,
        dorama: doramas.results[0]?.backdrop_path,
      }
    },
    staleTime: Infinity,
  })

  const toggleType = (type: ContentType) => {
    if (contentTypes.includes(type)) {
      setContentTypes(contentTypes.filter(t => t !== type))
    } else {
      setContentTypes([...contentTypes, type])
    }
  }

  const canContinue = contentTypes.length > 0

  return (
    <div className="flex flex-1 flex-col justify-between px-6 pb-8 pt-4">
      <div className="flex flex-col gap-4 text-center mt-4 md:mt-2">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">
          {title}
        </h1>

        <div className="grid grid-cols-2 gap-3 md:gap-4 mt-4 max-w-2xl mx-auto w-full">
          {(['movie', 'tv', 'anime', 'dorama'] as ContentType[]).map(type => {
            const isSelected = contentTypes.includes(type)
            const backdrop = backdrops?.[type]

            return (
              <button
                type="button"
                key={type}
                onClick={() => toggleType(type)}
                className={`group relative aspect-[4/3] w-full overflow-hidden rounded-2xl border-2 text-left transition-all active:scale-95 ${
                  isSelected
                    ? 'border-foreground shadow-lg shadow-foreground/20'
                    : 'border-transparent'
                }`}
              >
                <div className="absolute inset-0 bg-muted">
                  {backdrop && (
                    <Image
                      src={tmdbImage(backdrop, 'w500')}
                      alt={CONTENT_TYPE_LABELS[type]}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, 200px"
                    />
                  )}
                </div>

                <div
                  className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity ${
                    isSelected
                      ? 'opacity-100'
                      : 'opacity-70 group-hover:opacity-90'
                  }`}
                />

                {isSelected && (
                  <div className="absolute inset-0 bg-foreground/20" />
                )}

                <div className="absolute inset-0 flex flex-col p-3">
                  {isSelected && (
                    <div className="flex justify-end animate-in zoom-in duration-200">
                      <CheckCircle className="h-5 w-5 text-white bg-foreground rounded-full" />
                    </div>
                  )}

                  <div className="mt-auto">
                    <span className="text-sm font-semibold text-white drop-shadow-md">
                      {CONTENT_TYPE_LABELS[type]}
                    </span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-8 mx-auto w-full max-w-xs">
        <button
          type="button"
          onClick={nextStep}
          disabled={!canContinue}
          className="w-full rounded-full bg-foreground py-3 text-center text-sm font-semibold text-background transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100"
        >
          {cta}
        </button>
      </div>
    </div>
  )
}
