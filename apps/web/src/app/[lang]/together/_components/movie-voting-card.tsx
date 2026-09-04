'use client'

import Image from 'next/image'
import { PosterFallback } from '@/components/poster-fallback'
import { tmdbImage } from '@/utils/tmdb/image'

type MovieVotingCardProps = {
  title: string
  year?: string
  runtime?: string | null
  genre?: string | null
  overview?: string | null
  posterPath: string | null
}

export function MovieVotingCard({
  title,
  year,
  runtime,
  genre,
  overview,
  posterPath,
}: MovieVotingCardProps) {
  const meta = [year, runtime, genre].filter(Boolean).join('  ·  ')
  const synopsis = overview?.trim()

  return (
    <div className="w-full">
      <div className="together-poster together-surface overflow-hidden rounded-[1.35rem]">
        <div className="relative h-full w-full">
          {posterPath ? (
            <Image
              src={tmdbImage(posterPath, 'w500')}
              alt={title}
              fill
              priority
              className="object-cover"
            />
          ) : (
            <PosterFallback title={title} />
          )}
        </div>
      </div>
      <h2 className="together-heading mt-4">{title}</h2>
      {meta ? (
        <p className="together-meta together-fg-subtle mt-1.5">{meta}</p>
      ) : null}
      {synopsis ? (
        <p className="together-body together-fg-muted mt-2.5 line-clamp-3">
          {synopsis}
        </p>
      ) : null}
    </div>
  )
}
