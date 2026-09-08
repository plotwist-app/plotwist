'use client'

import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { useLanguage } from '@/context/language'
import { tmdb } from '@/services/tmdb'
import {
  clearTogetherToken,
  createTogetherSwipe,
  getTogetherMatches,
  getTogetherRoom,
  getTogetherToken,
  type TogetherDecision,
  type TogetherMatch,
} from '@/services/together'
import { MatchCelebration } from './match-celebration'
import { MovieDecisionButtons } from './movie-decision-buttons'
import { MovieVotingCard } from './movie-voting-card'
import { TogetherMark } from './together-mark'
import {
  acknowledgeTogetherMatch,
  firstUnacknowledgedTogetherMatch,
  togetherMatchKey,
} from './together-match-notifications'
import { TogetherShell } from './together-shell'

type DeckMovie = {
  id: number
  title: string
  poster_path: string | null
  release_date?: string
  overview: string
  vote_average: number
}

function formatRuntime(minutes?: number | null) {
  if (!minutes) return null
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (!hours) return `${rest}min`
  return rest ? `${hours}h ${rest}min` : `${hours}h`
}

const DECISION_MAP: Record<'nope' | 'maybe' | 'yes', TogetherDecision> = {
  nope: 'PASS',
  maybe: 'MAYBE',
  yes: 'LIKE',
}

export function TogetherVote({ code }: { code: string }) {
  const { dictionary, language } = useLanguage()
  const copy = dictionary.together
  const router = useRouter()
  const queryClient = useQueryClient()
  const roomCode = code.toUpperCase()
  const [token, setToken] = useState<string | null>(null)
  const [localSwiped, setLocalSwiped] = useState<Set<number>>(new Set())
  const [isVoting, setIsVoting] = useState(false)
  const [celebratedMatch, setCelebratedMatch] = useState<TogetherMatch | null>(
    null
  )
  const votingRef = useRef(false)

  useEffect(() => {
    const stored = getTogetherToken(roomCode)
    setToken(stored)
    if (!stored) {
      router.replace(`/${language}/together/${roomCode}`)
    }
  }, [language, roomCode, router])

  const roomQuery = useQuery({
    queryKey: ['together-room', roomCode, token],
    queryFn: () => getTogetherRoom(roomCode, token),
    enabled: Boolean(token),
  })

  const matchesQueryKey = useMemo(
    () => ['together-matches', roomCode, token] as const,
    [roomCode, token]
  )
  const matchesQuery = useQuery({
    queryKey: matchesQueryKey,
    queryFn: () => getTogetherMatches(roomCode, token ?? ''),
    enabled: Boolean(token),
    refetchInterval: 3000,
  })

  useEffect(() => {
    if (celebratedMatch) return
    const nextMatch = firstUnacknowledgedTogetherMatch(
      roomCode,
      matchesQuery.data?.matches ?? []
    )
    if (nextMatch) setCelebratedMatch(nextMatch)
  }, [celebratedMatch, matchesQuery.data?.matches, roomCode])

  useEffect(() => {
    if (!token || !roomQuery.data || roomQuery.data.me) return
    clearTogetherToken(roomCode)
    router.replace(`/${language}/together/${roomCode}`)
  }, [language, roomCode, roomQuery.data, router, token])

  const swiped = useMemo(() => {
    const ids = new Set(
      (roomQuery.data?.swipedIds ?? [])
        .filter(item => item.mediaType === 'MOVIE')
        .map(item => item.tmdbId)
    )
    for (const id of localSwiped) ids.add(id)
    return ids
  }, [localSwiped, roomQuery.data?.swipedIds])

  const watchProviderIds = roomQuery.data?.room.watchProviderIds ?? []
  const watchRegion = roomQuery.data?.room.watchRegion ?? 'BR'

  const deckQuery = useInfiniteQuery({
    queryKey: [
      'together-vote-deck',
      language,
      watchProviderIds.join('|'),
      watchRegion,
    ],
    enabled: Boolean(roomQuery.data),
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const movies = await tmdb.movies.discover({
        language,
        page: pageParam,
        filters: {
          sort_by: 'popularity.desc',
          'vote_count.gte': '80',
          ...(watchProviderIds.length > 0 && {
            with_watch_providers: watchProviderIds.join('|'),
            watch_region: watchRegion,
          }),
        },
      })
      return {
        results: movies.results as DeckMovie[],
        page: movies.page,
        totalPages: movies.total_pages,
      }
    },
    getNextPageParam: lastPage =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
  })

  const titles = useMemo(() => {
    const all = deckQuery.data?.pages.flatMap(page => page.results) ?? []
    return all.filter(title => !swiped.has(title.id))
  }, [deckQuery.data, swiped])

  const current = titles[0]

  const detailsQuery = useQuery({
    queryKey: ['together-movie-details', language, current?.id],
    enabled: Boolean(current),
    queryFn: () => tmdb.movies.details(current?.id ?? 0, language),
  })

  useEffect(() => {
    if (
      titles.length < 5 &&
      deckQuery.hasNextPage &&
      !deckQuery.isFetchingNextPage
    ) {
      void deckQuery.fetchNextPage()
    }
  }, [deckQuery, titles.length])

  const decide = useCallback(
    async (choice: 'nope' | 'maybe' | 'yes') => {
      if (!token || !current || votingRef.current) return
      votingRef.current = true
      setIsVoting(true)
      try {
        navigator.vibrate?.(10)
        const result = await createTogetherSwipe(roomCode, token, {
          tmdbId: current.id,
          mediaType: 'MOVIE',
          decision: DECISION_MAP[choice],
          title: current.title,
          posterPath: current.poster_path,
          voteAverage: current.vote_average,
          releaseDate: current.release_date ?? null,
          overview: current.overview,
        })
        const swipeMatch = result.match
        if (swipeMatch) {
          queryClient.setQueryData<{ matches: TogetherMatch[] }>(
            matchesQueryKey,
            currentMatches => {
              const matches = currentMatches?.matches ?? []
              const matchKey = togetherMatchKey(swipeMatch)
              if (matches.some(match => togetherMatchKey(match) === matchKey)) {
                return currentMatches
              }
              return { matches: [swipeMatch, ...matches] }
            }
          )
        }
        setLocalSwiped(value => new Set(value).add(current.id))
        void roomQuery.refetch()
      } catch {
        toast.error(copy.swipe_error)
      } finally {
        votingRef.current = false
        setIsVoting(false)
      }
    },
    [
      copy.swipe_error,
      current,
      matchesQueryKey,
      queryClient,
      roomCode,
      roomQuery,
      token,
    ]
  )

  const acknowledgeCelebration = useCallback(() => {
    if (!celebratedMatch) return
    acknowledgeTogetherMatch(roomCode, celebratedMatch)
    setCelebratedMatch(null)
  }, [celebratedMatch, roomCode])

  const viewMatches = useCallback(() => {
    if (!celebratedMatch) return
    acknowledgeTogetherMatch(roomCode, celebratedMatch)
    setCelebratedMatch(null)
    router.push(`/${language}/together/${roomCode}/matches`)
  }, [celebratedMatch, language, roomCode, router])

  if (!token || roomQuery.isLoading) {
    return (
      <TogetherShell>
        <p className="together-body together-fg-muted py-20 text-center">
          {copy.loading}
        </p>
      </TogetherShell>
    )
  }

  const details = detailsQuery.data
  const runtime = formatRuntime(details?.runtime)
  const genre = details?.genres
    ?.slice(0, 2)
    .map(item => item.name)
    .join(', ')
  const partnerName = roomQuery.data?.participants.find(
    participant => participant.id !== roomQuery.data.me?.id
  )?.displayName

  return (
    <TogetherShell className="pb-0">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <TogetherMark />
          {partnerName ? (
            <p className="together-heading together-fg-accent mt-3">
              {copy.tonight_with.replace('{name}', partnerName)}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          className="together-label together-fg-accent pb-0.5 underline-offset-4 hover:underline"
          onClick={() =>
            router.push(`/${language}/together/${roomCode}/matches`)
          }
        >
          {copy.see_matches}
        </button>
      </div>

      <div className="flex min-h-0 flex-1 items-start">
        <AnimatePresence mode="wait">
          {current ? (
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
              className="w-full"
            >
              <MovieVotingCard
                title={details?.title ?? current.title}
                year={(
                  details?.release_date ??
                  current.release_date ??
                  ''
                ).slice(0, 4)}
                runtime={runtime}
                genre={genre}
                posterPath={details?.poster_path ?? current.poster_path}
                overview={details?.overview || current.overview}
              />
            </motion.div>
          ) : (
            <motion.p
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="together-body together-dashed together-fg-muted w-full rounded-[1.5rem] p-10 text-center"
            >
              {copy.empty_deck}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div className="together-vote-bar sticky bottom-0 -mx-5 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5">
        {current ? (
          <MovieDecisionButtons
            disabled={isVoting}
            labels={{
              nope: copy.vote_nope,
              maybe: copy.vote_maybe,
              yes: copy.vote_yes,
            }}
            onDecide={decision => void decide(decision)}
          />
        ) : (
          <button
            type="button"
            className="together-label together-fg-accent mx-auto block underline-offset-4 hover:underline"
            onClick={() =>
              router.push(`/${language}/together/${roomCode}/matches`)
            }
          >
            {copy.see_matches}
          </button>
        )}
      </div>

      {celebratedMatch ? (
        <MatchCelebration
          match={celebratedMatch}
          copy={{
            heading: copy.match_heading,
            interestSummary: copy.match_interest_summary,
            continueDiscovering: copy.continue_discovering,
            viewMatches: copy.view_matches,
          }}
          onContinue={acknowledgeCelebration}
          onViewMatches={viewMatches}
        />
      ) : null}
    </TogetherShell>
  )
}
