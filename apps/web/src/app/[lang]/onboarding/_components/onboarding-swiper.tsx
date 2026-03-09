'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { AnimatePresence, motion, type PanInfo } from 'framer-motion'
import { Bookmark, Check, X as XIcon } from 'lucide-react'
import Image from 'next/image'
import { useCallback, useMemo, useState } from 'react'
import { tmdb } from '@/services/tmdb'
import { tmdbImage } from '@/utils/tmdb/image'

type SwipeDirection = 'left' | 'right' | 'up' | null

type Movie = {
  id: number
  title: string
  poster_path: string
  backdrop_path: string
  release_date: string
  vote_average: number
  overview: string
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

  // Vertical takes priority if clearly vertical
  if (offsetY < -40 && absY > absX * 0.8) return 'up'
  if (offsetX > 40 && absX > absY * 0.6) return 'right'
  if (offsetX < -40 && absX > absY * 0.6) return 'left'

  return null
}

function getSwipeConfig(dir: SwipeDirection) {
  switch (dir) {
    case 'right':
      return {
        icon: Bookmark,
        label: 'Quero assistir',
        colorClass: 'text-blue-500',
        bgClass: 'border-blue-500/60',
      }
    case 'left':
      return {
        icon: XIcon,
        label: 'Não interessado',
        colorClass: 'text-red-400',
        bgClass: 'border-red-400/60',
      }
    case 'up':
      return {
        icon: Check,
        label: 'Já assisti',
        colorClass: 'text-green-500',
        bgClass: 'border-green-500/60',
      }
    default:
      return null
  }
}

// ─── Swipeable Card ────────────────────────────────────────────────────
function SwipeCard({
  movie,
  onSwipe,
  onDirectionChange,
}: {
  movie: Movie
  onSwipe: (dir: SwipeDirection) => void
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
        onSwipe(dir)
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
            <span className="text-muted-foreground text-sm">Sem poster</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ─── Exit animation card ─────────────────────────────────────────────
function ExitCard({
  movie,
  direction,
  onComplete,
}: {
  movie: Movie
  direction: SwipeDirection
  onComplete: () => void
}) {
  const exitX = direction === 'right' ? 500 : direction === 'left' ? -500 : 0
  const exitY = direction === 'up' ? -600 : 0
  const exitRotation =
    direction === 'right' ? 25 : direction === 'left' ? -25 : 0

  return (
    <motion.div
      className="absolute inset-0"
      initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
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
        {movie.poster_path && (
          <Image
            src={tmdbImage(movie.poster_path, 'w500')}
            alt={movie.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 70vw, 280px"
          />
        )}
      </div>
    </motion.div>
  )
}

// ─── Pill Overlay ────────────────────────────────────────────────────
function SwipePillOverlay({
  direction,
  progress,
}: {
  direction: SwipeDirection
  progress: number
}) {
  const config = getSwipeConfig(direction)
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

export const OnboardingSwiper = ({ lang }: OnboardingSwiperProps) => {
  const language = lang || 'en-US'
  const [currentIndex, setCurrentIndex] = useState(0)
  const [swipeDirection, setSwipeDirection] = useState<SwipeDirection>(null)
  const [swipeProgress, setSwipeProgress] = useState(0)
  const [exitingCard, setExitingCard] = useState<{
    movie: Movie
    direction: SwipeDirection
  } | null>(null)
  const [counts, setCounts] = useState({ watchlist: 0, watched: 0, skipped: 0 })

  const { data, fetchNextPage } = useInfiniteQuery({
    queryKey: ['onboarding-movies', language],
    queryFn: ({ pageParam }) =>
      tmdb.movies.discover({
        filters: { sort_by: 'popularity.desc', 'vote_count.gte': '200' },
        language,
        page: pageParam,
      }),
    getNextPageParam: lastPage => lastPage.page + 1,
    initialPageParam: 1,
  })

  const movies = useMemo(
    () => (data?.pages.flatMap(p => p.results) ?? []) as Movie[],
    [data]
  )

  const visibleCards = movies.slice(currentIndex, currentIndex + 3)
  const currentMovie = visibleCards[0]

  const handleSwipe = useCallback(
    (dir: SwipeDirection) => {
      if (!currentMovie || exitingCard) return

      setSwipeDirection(null)
      setSwipeProgress(0)
      setExitingCard({ movie: currentMovie, direction: dir })

      setCounts(prev => ({
        watchlist: dir === 'right' ? prev.watchlist + 1 : prev.watchlist,
        watched: dir === 'up' ? prev.watched + 1 : prev.watched,
        skipped: dir === 'left' ? prev.skipped + 1 : prev.skipped,
      }))
    },
    [currentMovie, exitingCard]
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

  const total = counts.watchlist + counts.watched + counts.skipped

  if (!currentMovie && !exitingCard) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Carregando filmes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center overflow-hidden bg-background px-4 pb-10 pt-8">
      <div className="flex w-full max-w-sm flex-col items-center gap-2">
        <h1 className="text-2xl font-bold tracking-tight">
          Descubra seus filmes
        </h1>
        <p className="text-sm text-muted-foreground text-center">
          Arraste para os lados para adicionar à sua lista
        </p>
      </div>

      <div
        className="relative mx-auto mt-6 w-full select-none"
        style={{ maxWidth: 280, aspectRatio: '2/3' }}
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
                className="absolute inset-0 overflow-hidden rounded-[32px] border border-border/20 shadow-lg"
                style={{
                  transform: `scale(${style.scale}) rotate(${style.rotation}deg) translate(${style.offsetX}px, ${style.offsetY}px)`,
                  zIndex: 3 - stackIdx,
                }}
              >
                {movie.poster_path && (
                  <Image
                    src={tmdbImage(movie.poster_path, 'w500')}
                    alt={movie.title}
                    fill
                    className="object-cover"
                    sizes="280px"
                  />
                )}
              </div>
            )
          })}

        {currentMovie && !exitingCard && (
          <SwipeCard
            key={currentMovie.id}
            movie={currentMovie}
            onSwipe={handleSwipe}
            onDirectionChange={handleDirectionChange}
          />
        )}

        <AnimatePresence>
          {exitingCard && (
            <ExitCard
              key={`exit-${exitingCard.movie.id}`}
              movie={exitingCard.movie}
              direction={exitingCard.direction}
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
            />
          )}
        </AnimatePresence>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => handleSwipe('up')}
          className="flex items-center gap-1.5 rounded-xl bg-muted/80 px-4 py-2.5 text-sm font-medium transition-all hover:bg-muted active:scale-95"
        >
          <Check className="h-4 w-4 text-green-500" />
          <span>Já assisti</span>
        </button>

        <button
          type="button"
          onClick={() => handleSwipe('right')}
          className="flex items-center gap-1.5 rounded-xl bg-muted/80 px-4 py-2.5 text-sm font-medium transition-all hover:bg-muted active:scale-95"
        >
          <Bookmark className="h-4 w-4 text-blue-500" />
          <span>Quero assistir</span>
        </button>

        <button
          type="button"
          onClick={() => handleSwipe('left')}
          className="flex items-center gap-1.5 rounded-xl bg-muted/80 px-4 py-2.5 text-sm font-medium transition-all hover:bg-muted active:scale-95"
        >
          <XIcon className="h-4 w-4 text-red-400" />
          <span>Não interessado</span>
        </button>
      </div>

      {total > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex items-center gap-4 text-xs text-muted-foreground"
        >
          {counts.watched > 0 && (
            <span className="flex items-center gap-1">
              <Check className="h-3 w-3 text-green-500" />
              {counts.watched}
            </span>
          )}
          {counts.watchlist > 0 && (
            <span className="flex items-center gap-1">
              <Bookmark className="h-3 w-3 text-blue-500" />
              {counts.watchlist}
            </span>
          )}
          {counts.skipped > 0 && (
            <span className="flex items-center gap-1">
              <XIcon className="h-3 w-3 text-red-400" />
              {counts.skipped}
            </span>
          )}
        </motion.div>
      )}
    </div>
  )
}
