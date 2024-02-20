import React, { forwardRef } from 'react'
import { TvShowCardSkeleton } from '../tv-show-card'

export const TvShowsListSkeleton = forwardRef<HTMLDivElement>((_, ref) => (
  <div
    className="grid w-full grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-3"
    ref={ref}
  >
    {Array.from({ length: 10 }, (_, index) => (
      <TvShowCardSkeleton key={index} />
    ))}
  </div>
))
TvShowsListSkeleton.displayName = 'TvShowListSkeleton'
