import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { tmdb } from '@/services/tmdb'
import type { Language } from '@/types/languages'
import { useOnboarding } from '../onboarding-context'

export function OnboardingGenres({ lang }: { lang: string }) {
  const { genres, setGenres, contentTypes, nextStep, dictionary } =
    useOnboarding()
  const language = (lang as Language) || 'en-US'

  const title = dictionary?.genres_title || 'Pick your favorite genres'
  const subtitle = dictionary?.genres_subtitle || 'Select at least one genre'
  const cta = dictionary?.continue || 'Continue'
  const selectPrompt = dictionary?.genres_select_prompt || 'Select a genre'

  const { data: movieGenresData } = useQuery({
    queryKey: ['tmdb-genres-movie', language],
    queryFn: () => tmdb.genres('movie', language),
    staleTime: Infinity,
  })

  const { data: tvGenresData } = useQuery({
    queryKey: ['tmdb-genres-tv', language],
    queryFn: () => tmdb.genres('tv', language),
    staleTime: Infinity,
  })

  const availableGenres = useMemo(() => {
    let combined: { id: number; name: string }[] = []

    if (contentTypes.includes('movie')) {
      combined = [...combined, ...(movieGenresData?.genres || [])]
    }

    if (contentTypes.includes('tv') || contentTypes.includes('dorama') || contentTypes.includes('anime')) {
      combined = [...combined, ...(tvGenresData?.genres || [])]
    }

    if (contentTypes.includes('anime') && !contentTypes.includes('tv')) {
      const animationGenre = tvGenresData?.genres.find(g => g.id === 16)
      if (animationGenre) {
        combined.push(animationGenre)
      }
    }

    const unique = Array.from(
      new Map(combined.map(item => [item.id, item])).values()
    )

    return unique.sort((a, b) => a.name.localeCompare(b.name))
  }, [contentTypes, movieGenresData, tvGenresData])

  const toggleGenre = (id: number) => {
    if (genres.includes(id)) {
      setGenres(genres.filter(g => g !== id))
    } else {
      setGenres([...genres, id])
    }
  }

  const canContinue = genres.length > 0

  return (
    <div className="flex flex-1 flex-col justify-between px-6 pb-8 pt-4">
      <div className="flex flex-col gap-4 text-center mt-4 md:mt-2">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">
          {title}
        </h1>
        <p className="text-muted-foreground text-xs md:text-sm">
          {subtitle}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2.5 md:gap-3 mt-4 max-w-3xl mx-auto w-full">
          {availableGenres.map(genre => {
            const isSelected = genres.includes(genre.id)
            return (
              <button
                key={genre.id}
                onClick={() => toggleGenre(genre.id)}
                className={`px-4 py-2 text-sm rounded-full border transition-all active:scale-95 ${
                  isSelected 
                    ? 'bg-foreground text-background border-foreground font-medium scale-105' 
                    : 'bg-muted border-border font-normal hover:bg-muted/80'
                }`}
              >
                {genre.name}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-8 mx-auto w-full max-w-xs">
        <button
          onClick={nextStep}
          disabled={!canContinue}
          className="w-full rounded-full bg-foreground py-3 text-center text-sm font-semibold text-background transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100"
        >
          {canContinue ? cta : selectPrompt}
        </button>
      </div>
    </div>
  )
}
