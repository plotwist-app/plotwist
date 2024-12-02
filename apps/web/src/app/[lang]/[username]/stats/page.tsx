import { TotalHours, TotalHoursSkeleton } from './_total_hours'
import { Genres, GenresSkeleton } from './_genres'
import {
  MostWatchedSeries,
  MostWatchedSeriesSkeleton,
} from './_most_watched-series'
import { ReviewsCount, ReviewsCountSkeleton } from './_reviews-count'
import { TopActors } from './_top_actors'
import { Countries } from './_countries'
import { BestRated } from './_best_rated'
import { Status } from './_status'
import { Suspense } from 'react'

export default function StatsPage() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Suspense fallback={<TotalHoursSkeleton />}>
        <TotalHours />
      </Suspense>

      <Suspense fallback={<ReviewsCountSkeleton />}>
        <ReviewsCount />
      </Suspense>

      <Suspense fallback={<MostWatchedSeriesSkeleton />}>
        <MostWatchedSeries />
      </Suspense>

      <Suspense fallback={<GenresSkeleton />}>
        <Genres />
      </Suspense>

      {/* <TopActors />
      <Countries />
      <BestRated />
      <Status /> */}
    </div>
  )
}
