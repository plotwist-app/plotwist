'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { AnimatePresence, motion, type PanInfo } from 'framer-motion'
import { Bookmark, Check, Eye, Pointer, X as XIcon } from 'lucide-react'
import Image from 'next/image'
import { PosterFallback } from '@/components/poster-fallback'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { tmdb } from '@/services/tmdb'
import type { Language } from '@/types/languages'
import { tmdbImage } from '@/utils/tmdb/image'
import { useOnboarding } from './onboarding-context'

type SwipeDirection = 'left' | 'right' | 'up' | 'down' | null

type Movie = {
  id: number
  title: string
  poster_path: string
  backdrop_path: string
  release_date: string
  vote_average: number
  overview: string
  mediaType?: 'MOVIE' | 'TV_SHOW'
}

type OnboardingSwiperProps = {
  lang: string
}

const SWIPE_THRESHOLD = 120
const CARD_STYLES = [
  { scale: 1, rotation: 0, offsetX: 0, offsetY: 0 },
  { scale: 0.93, rotation: 10, offsetX: 12, offsetY: 4 },
  { scale: 0.86, rotation: -18, offsetX: -20, offsetY: 8 },
]

function getSwipeDirection(offsetX: number, offsetY: number): SwipeDirection {
  const absX = Math.abs(offsetX)
  const absY = Math.abs(offsetY)

  if (absX < 40 && absY < 40) return null

  if (offsetY < -40 && absY > absX * 0.8) return 'up'
  if (offsetY > 40 && absY > absX * 0.8) return 'down'
  if (offsetX > 40 && absX > absY * 0.6) return 'right'
  if (offsetX < -40 && absX > absY * 0.6) return 'left'

  return null
}

function getSwipeConfig(
  dir: SwipeDirection,
  dictionary?: Record<string, string>
) {
  switch (dir) {
    case 'right':
      return {
        icon: Bookmark,
        label: dictionary?.swiper_want_to_watch || 'Want to watch',
        colorClass: 'text-blue-500',
        bgClass: 'border-blue-500/60',
      }
    case 'left':
      return {
        icon: XIcon,
        label: dictionary?.swiper_skip || 'Skip',
        colorClass: 'text-red-400',
        bgClass: 'border-red-400/60',
      }
    case 'up':
      return {
        icon: Check,
        label: dictionary?.swiper_watched || 'Watched',
        colorClass: 'text-green-500',
        bgClass: 'border-green-500/60',
      }
    case 'down':
      return {
        icon: Eye,
        label: dictionary?.swiper_watching || 'Watching',
        colorClass: 'text-yellow-500',
        bgClass: 'border-yellow-500/60',
      }
    default:
      return null
  }
}

function SwipeCard({
  movie,
  onSwipe,
  onDirectionChange,
}: {
  movie: Movie
  onSwipe: (
    dir: SwipeDirection,
    velocityInfo?: { x: number; y: number }
  ) => void
  onDirectionChange: (dir: SwipeDirection, progress: number) => void
}) {
  const handleDrag = useCallback(
    (_: unknown, info: PanInfo) => {
      const dir = getSwipeDirection(info.offset.x, info.offset.y)
      const dist = Math.sqrt(info.offset.x ** 2 + info.offset.y ** 2)
      const progress = Math.min(dist / SWIPE_THRESHOLD, 1)
      onDirectionChange(dir, progress)
    },
    [onDirectionChange]
  )

  const handleDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      const dir = getSwipeDirection(info.offset.x, info.offset.y)
      const dist = Math.sqrt(info.offset.x ** 2 + info.offset.y ** 2)

      if (dir && dist > SWIPE_THRESHOLD) {
        onSwipe(dir, { x: info.offset.x, y: info.offset.y })
      } else {
        onDirectionChange(null, 0)
      }
    },
    [onSwipe, onDirectionChange]
  )

  return (
    <motion.div
      className="absolute inset-0 cursor-grab active:cursor-grabbing touch-none select-none"
      style={{ zIndex: 10 }}
      drag
      dragSnapToOrigin
      dragMomentum={false}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.02 }}
    >
      <div className="pointer-events-none relative h-full w-full overflow-hidden rounded-[32px] border border-border/30 shadow-xl shadow-black/20">
        {movie.poster_path ? (
          <Image
            src={tmdbImage(movie.poster_path, 'w500')}
            alt={movie.title}
            fill
            priority
            draggable={false}
            className="object-cover pointer-events-none"
            sizes="(max-width: 640px) 70vw, 280px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <span className="text-muted-foreground text-sm">No poster</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

function ExitCard({
  movie,
  direction,
  initialOffset,
  onComplete,
}: {
  movie: Movie
  direction: SwipeDirection
  initialOffset?: { x: number; y: number }
  onComplete: () => void
}) {
  const exitX = direction === 'right' ? 500 : direction === 'left' ? -500 : 0
  const exitY = direction === 'up' ? -600 : direction === 'down' ? 600 : 0
  const exitRotation =
    direction === 'right' ? 25 : direction === 'left' ? -25 : 0

  return (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      initial={{
        x: initialOffset?.x || 0,
        y: initialOffset?.y || 0,
        rotate: initialOffset
          ? (initialOffset.x /
              (typeof window !== 'undefined' ? window.innerWidth : 375)) *
            50
          : 0,
        opacity: 1,
      }}
      animate={{
        x: exitX,
        y: exitY,
        rotate: exitRotation,
        opacity: 0,
      }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      onAnimationComplete={onComplete}
      style={{ zIndex: 20 }}
    >
      <div className="relative h-full w-full overflow-hidden rounded-[32px] border border-border/30 shadow-xl shadow-black/20">
        {movie.poster_path ? (
          <Image
            src={tmdbImage(movie.poster_path, 'w500')}
            alt={movie.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 70vw, 280px"
          />
        ) : (
          <PosterFallback title={movie.title} />
        )}
      </div>
    </motion.div>
  )
}

function SwipePillOverlay({
  direction,
  progress,
  dictionary,
}: {
  direction: SwipeDirection
  progress: number
  dictionary?: Record<string, string>
}) {
  const config = getSwipeConfig(direction, dictionary)
  if (!config || progress < 0.3) return null

  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: Math.min(progress * 1.5, 1), scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
    >
      <div
        className={`flex items-center gap-2 rounded-full border-2 ${config.bgClass} bg-black/80 px-5 py-2.5 backdrop-blur-sm`}
      >
        <Icon className={`h-5 w-5 ${config.colorClass}`} />
        <span className="text-sm font-semibold text-white">{config.label}</span>
      </div>
    </motion.div>
  )
}

function SwipeHintOverlay() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
    >
      <motion.div
        animate={{
          scale: [1, 1.12, 1.06, 1],
          x: [0, 0, 55, 0],
          y: [0, -3, 0, 0],
          rotate: [0, 0, -6, 0],
        }}
        transition={{
          duration: 1.5,
          ease: 'easeInOut',
          times: [0, 0.2, 0.6, 1],
          repeat: Infinity,
          repeatDelay: 1,
        }}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 border border-white/30 backdrop-blur-md shadow-lg"
      >
        <motion.div
          animate={{ opacity: [0.6, 0.9, 0.9, 0.6] }}
          transition={{
            duration: 1.5,
            ease: 'easeInOut',
            times: [0, 0.2, 0.6, 1],
            repeat: Infinity,
            repeatDelay: 1,
          }}
        >
          <Pointer className="h-5 w-5 text-white" />
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

export const OnboardingSwiper = ({ lang }: OnboardingSwiperProps) => {
  const language = (lang as Language) || 'en-US'
  const {
    genres,
    contentTypes,
    incrementSavedTitles,
    savedTitlesCount,
    nextStep,
    dictionary,
    addSwipedItem,
  } = useOnboarding()

  const title = dictionary?.swiper_title || 'Discover titles'
  const subtitle =
    dictionary?.swiper_subtitle || 'Swipe sideways to add to your list'
  const emptyText =
    dictionary?.swiper_empty || 'No titles found with these preferences.'
  const fetchingText = dictionary?.swiper_fetching || 'Fetching titles...'

  const [currentIndex, setCurrentIndex] = useState(0)
  const [swipeDirection, setSwipeDirection] = useState<SwipeDirection>(null)
  const [swipeProgress, setSwipeProgress] = useState(0)
  const [exitingCard, setExitingCard] = useState<{
    movie: Movie
    direction: SwipeDirection
    initialOffset?: { x: number; y: number }
  } | null>(null)

  // Drag hint state
  const [showHint, setShowHint] = useState(false)
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const startIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    idleTimerRef.current = setTimeout(() => setShowHint(true), 2000)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setShowHint(true), 1000)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    }
  }, [])

  const { data, fetchNextPage, isFetching } = useInfiniteQuery({
    queryKey: [
      'onboarding-swiper-movies',
      language,
      genres.join(','),
      contentTypes.join(','),
    ],
    queryFn: async ({ pageParam }) => {
      const fetchMovies = contentTypes.includes('movie')
      const fetchTV = contentTypes.includes('tv')
      const fetchAnime = contentTypes.includes('anime')
      const fetchDorama = contentTypes.includes('dorama')

      const fetchDefault =
        !fetchMovies && !fetchTV && !fetchAnime && !fetchDorama

      const promises: Promise<{ type: 'movie' | 'tv'; data: any }>[] = []

      const baseFilters = {
        sort_by: 'vote_count.desc',
        with_genres: genres.length > 0 ? genres.join('|') : undefined,
      }

      if (fetchMovies || fetchDefault) {
        promises.push(
          tmdb.movies
            .discover({
              filters: baseFilters,
              language,
              page: pageParam as number,
            })
            .then(data => ({ type: 'movie', data }))
        )
      }

      if (fetchTV) {
        promises.push(
          tmdb.tv
            .discover({
              filters: baseFilters,
              language,
              page: pageParam as number,
            })
            .then(data => ({ type: 'tv', data }))
        )
      }

      if (fetchAnime) {
        const animeFilters = {
          ...baseFilters,
          with_original_language: 'ja',
          with_genres: genres.includes(16)
            ? genres.join('|')
            : genres.length > 0
              ? `${genres.join('|')}|16`
              : '16',
        }
        promises.push(
          tmdb.tv
            .discover({
              filters: animeFilters as any,
              language,
              page: pageParam as number,
            })
            .then(data => ({ type: 'tv', data }))
        )
      }

      if (fetchDorama) {
        const doramaFilters = { ...baseFilters, with_original_language: 'ko' }
        promises.push(
          tmdb.tv
            .discover({
              filters: doramaFilters as any,
              language,
              page: pageParam as number,
            })
            .then(data => ({ type: 'tv', data }))
        )
      }

      const results = await Promise.all(promises)
      const combinedResults: any[] = []

      for (const res of results) {
        if (!res.data || !res.data.results) continue

        if (res.type === 'movie') {
          combinedResults.push(
            ...res.data.results.map((item: any) => ({
              ...item,
              mediaType: 'MOVIE',
              title: item.title,
              release_date: item.release_date,
            }))
          )
        } else {
          combinedResults.push(
            ...res.data.results.map((item: any) => ({
              ...item,
              mediaType: 'TV_SHOW',
              title: item.name || item.title,
              release_date: item.first_air_date || item.release_date,
            }))
          )
        }
      }

      const uniqueResults = Array.from(
        new Map(combinedResults.map(item => [item.id, item])).values()
      )

      uniqueResults.sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0))

      return {
        page: pageParam,
        results: uniqueResults,
      }
    },
    getNextPageParam: lastPage => (lastPage.page as number) + 1,
    initialPageParam: 1,
  })

  const movies = useMemo(
    () => (data?.pages.flatMap(p => p.results) ?? []) as Movie[],
    [data]
  )

  const visibleCards = movies.slice(currentIndex, currentIndex + 3)
  const currentMovie = visibleCards[0]

  const handleSwipe = useCallback(
    (dir: SwipeDirection, velocityInfo?: { x: number; y: number }) => {
      if (!currentMovie || exitingCard) return

      setSwipeDirection(null)
      setSwipeProgress(0)
      setExitingCard({
        movie: currentMovie,
        direction: dir,
        initialOffset: velocityInfo,
      })

      const tmdbId = currentMovie.id
      const mediaType = currentMovie.mediaType

      let status: 'WATCHED' | 'WATCHING' | 'WATCHLIST' | 'DROPPED' | null = null

      switch (dir) {
        case 'right':
          status = 'WATCHLIST'
          break
        case 'up':
          status = 'WATCHED'
          break
        case 'down':
          status = 'WATCHING'
          break
        case 'left':
          // Skip, do not save
          break
      }

      if (status) {
        addSwipedItem({
          tmdbId,
          mediaType: mediaType as 'MOVIE' | 'TV_SHOW',
          status,
        })
        incrementSavedTitles()
      }
    },
    [currentMovie, exitingCard, incrementSavedTitles, addSwipedItem]
  )

  const handleExitComplete = useCallback(() => {
    setExitingCard(null)
    setCurrentIndex(prev => {
      const next = prev + 1
      if (movies.length - next < 5) {
        fetchNextPage()
      }
      return next
    })
  }, [movies.length, fetchNextPage])

  const handleDirectionChange = useCallback(
    (dir: SwipeDirection, progress: number) => {
      setSwipeDirection(dir)
      setSwipeProgress(progress)
    },
    []
  )

  const canContinue = savedTitlesCount >= 5

  if (!currentMovie && !exitingCard) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">
            {isFetching ? fetchingText : emptyText}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex flex-1 flex-col items-center overflow-hidden bg-background px-4 pb-6 pt-4">
      <div className="flex w-full flex-col items-center gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-center md:text-3xl">
          {title}
        </h1>
        <p className="text-xs text-muted-foreground text-center md:text-sm">
          {subtitle}
        </p>
      </div>

      <div
        className="relative mx-auto mt-4 w-full select-none max-w-[240px] sm:max-w-[280px] md:max-w-[300px]"
        style={{ aspectRatio: '2/3' }}
      >
        {visibleCards
          .slice(1, 3)
          .reverse()
          .map((movie, reversedIdx) => {
            const stackIdx = visibleCards.length <= 2 ? 1 : 2 - reversedIdx
            const style = CARD_STYLES[stackIdx] ?? CARD_STYLES[2]

            return (
              <div
                key={movie.id}
                className="absolute inset-0 overflow-hidden rounded-[32px] border border-border bg-muted shadow-lg"
                style={{
                  transform: `scale(${style.scale}) rotate(${style.rotation}deg) translate(${style.offsetX}px, ${style.offsetY}px)`,
                  zIndex: 3 - stackIdx,
                }}
              >
                {movie.poster_path ? (
                  <Image
                    src={tmdbImage(movie.poster_path, 'w500')}
                    alt={movie.title}
                    fill
                    className="object-cover"
                    sizes="280px"
                  />
                ) : (
                  <PosterFallback title={movie.title} />
                )}
              </div>
            )
          })}

        {currentMovie && !exitingCard && (
          <SwipeCard
            key={currentMovie.id}
            movie={currentMovie}
            onSwipe={(dir, vel) => {
              setShowHint(false)
              startIdleTimer()
              handleSwipe(dir, vel)
            }}
            onDirectionChange={(dir, progress) => {
              if (dir) {
                setShowHint(false)
                if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
              }
              handleDirectionChange(dir, progress)
            }}
          />
        )}

        <AnimatePresence>
          {showHint && !exitingCard && !swipeDirection && (
            <SwipeHintOverlay key="swipe-hint" />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {exitingCard && (
            <ExitCard
              key={`exit-${exitingCard.movie.id}`}
              movie={exitingCard.movie}
              direction={exitingCard.direction}
              initialOffset={exitingCard.initialOffset}
              onComplete={handleExitComplete}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {swipeDirection && swipeProgress > 0.3 && !exitingCard && (
            <SwipePillOverlay
              key="pill"
              direction={swipeDirection}
              progress={swipeProgress}
              dictionary={dictionary}
            />
          )}
        </AnimatePresence>
      </div>

      <div className="mt-4 sm:mt-6 flex flex-wrap items-center justify-center gap-2 md:gap-3 max-w-lg w-full">
        <button
          type="button"
          onClick={() => handleSwipe('up')}
          className="flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/10 px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm font-medium transition-transform hover:bg-green-500/20 active:scale-95"
          title={`${dictionary?.swiper_watched || 'Já assisti'} (Cima)`}
        >
          <Check className="h-4 w-4 text-green-500" />
          <span className="text-green-500">
            {dictionary?.swiper_watched || 'Já assisti'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleSwipe('down')}
          className="flex items-center gap-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm font-medium transition-transform hover:bg-yellow-500/20 active:scale-95"
          title={`${dictionary?.swiper_watching || 'Assistindo'} (Baixo)`}
        >
          <Eye className="h-4 w-4 text-yellow-500" />
          <span className="text-yellow-500">
            {dictionary?.swiper_watching || 'Assistindo'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleSwipe('right')}
          className="flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm font-medium transition-transform hover:bg-blue-500/20 active:scale-95"
          title={`${dictionary?.swiper_want_to_watch || 'Quero assistir'} (Direita)`}
        >
          <Bookmark className="h-4 w-4 text-blue-500" />
          <span className="text-blue-500">
            {dictionary?.swiper_want_to_watch || 'Quero assistir'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleSwipe('left')}
          className="flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm font-medium transition-transform hover:bg-red-500/20 active:scale-95"
          title={`${dictionary?.swiper_skip || 'Pular'} (Esquerda)`}
        >
          <XIcon className="h-4 w-4 text-red-500" />
          <span className="text-red-500">
            {dictionary?.swiper_skip || 'Pular'}
          </span>
        </button>
      </div>

      <div className="mt-auto pt-4 pb-2 w-full max-w-sm">
        <button
          type="button"
          onClick={nextStep}
          disabled={!canContinue}
          className="w-full flex flex-col items-center justify-center rounded-full bg-foreground py-3 text-center font-semibold text-background transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100"
        >
          {canContinue ? (
            <span>{dictionary?.swiper_finish_ready || "Let's go!"}</span>
          ) : (
            <div className="text-center text-sm md:text-base">
              <span>
                {Math.max(0, 5 - savedTitlesCount)}{' '}
                {dictionary?.swiper_finish_remaining || 'titles to go'}
              </span>
            </div>
          )}
        </button>
      </div>
    </div>
  )
}
