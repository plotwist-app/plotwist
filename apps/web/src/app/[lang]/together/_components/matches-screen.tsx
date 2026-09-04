'use client'

import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { PosterFallback } from '@/components/poster-fallback'
import { useLanguage } from '@/context/language'
import { getTogetherMatches, getTogetherToken } from '@/services/together'
import { tmdbImage } from '@/utils/tmdb/image'
import { PrimaryButton } from './primary-button'
import { TogetherMark } from './together-mark'
import { TogetherShell } from './together-shell'

export function MatchesScreen({ code }: { code: string }) {
  const { dictionary, language } = useLanguage()
  const copy = dictionary.together
  const router = useRouter()
  const roomCode = code.toUpperCase()
  const [token, setToken] = useState<string | null>(null)
  const [pickedId, setPickedId] = useState<number | null>(null)

  useEffect(() => {
    const stored = getTogetherToken(roomCode)
    setToken(stored)
    if (!stored) {
      router.replace(`/${language}/together/${roomCode}`)
    }
  }, [language, roomCode, router])

  const matchesQuery = useQuery({
    queryKey: ['together-matches', roomCode, token],
    queryFn: () => getTogetherMatches(roomCode, token ?? ''),
    enabled: Boolean(token),
    refetchInterval: 4000,
  })

  const matches = matchesQuery.data?.matches ?? []
  const recommendation = matches.find(match => match.highlighted) ?? matches[0]
  const rest = matches.filter(
    match =>
      !(
        match.tmdbId === recommendation?.tmdbId &&
        match.mediaType === recommendation?.mediaType
      )
  )

  return (
    <TogetherShell>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <TogetherMark />
          <p className="together-kicker together-fg-accent mt-4">
            {copy.its_this}
          </p>
          <h1 className="together-display mt-2">{copy.matches_title}</h1>
        </div>
        <button
          type="button"
          className="together-label together-fg-muted pb-1 underline-offset-4 hover:underline"
          onClick={() => router.push(`/${language}/together/${roomCode}/vote`)}
        >
          {copy.keep_choosing}
        </button>
      </div>

      {matches.length === 0 ? (
        <p className="together-body together-dashed together-fg-muted rounded-[1.5rem] p-8 text-center">
          {copy.matches_empty}
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {recommendation && (
            <article>
              <div className="together-surface relative aspect-[2/3] w-full overflow-hidden rounded-[1.5rem]">
                {recommendation.posterPath ? (
                  <Image
                    src={tmdbImage(recommendation.posterPath, 'w500')}
                    alt={recommendation.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <PosterFallback title={recommendation.title} />
                )}
              </div>
              <h2 className="together-heading mt-4">{recommendation.title}</h2>
              <PrimaryButton
                className="mt-4"
                onClick={() => {
                  setPickedId(recommendation.tmdbId)
                  router.push(`/${language}/movies/${recommendation.tmdbId}`)
                }}
              >
                {copy.pick_this}
              </PrimaryButton>
            </article>
          )}

          {rest.map(match => (
            <button
              key={`${match.mediaType}-${match.tmdbId}`}
              type="button"
              onClick={() => {
                setPickedId(match.tmdbId)
                router.push(`/${language}/movies/${match.tmdbId}`)
              }}
              className={`together-surface flex w-full items-center gap-4 rounded-[1.25rem] p-3 text-left ${
                pickedId === match.tmdbId
                  ? 'ring-1 ring-[var(--tg-accent)]'
                  : ''
              }`}
            >
              <div className="relative h-20 w-14 shrink-0 overflow-hidden rounded-xl">
                {match.posterPath ? (
                  <Image
                    src={tmdbImage(match.posterPath, 'w500')}
                    alt={match.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <PosterFallback title={match.title} />
                )}
              </div>
              <div className="min-w-0">
                <p className="together-title truncate">{match.title}</p>
                <p className="together-meta together-fg-subtle mt-0.5">
                  {copy.pick_this}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </TogetherShell>
  )
}
