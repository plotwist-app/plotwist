import React, { forwardRef } from 'react'
import { TvSerieCardSkeleton } from '../tv-serie-card'

export const TvSeriesListSkeleton = forwardRef<HTMLDivElement>((_, ref) => (
  <div
    className="grid w-full grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-3"
    ref={ref}
  >
    {Array.from({ length: 10 }, (_, index) => (
      <TvSerieCardSkeleton key={index} />
    ))}
  </div>
))
TvSeriesListSkeleton.displayName = 'TvSerieListSkeleton'
