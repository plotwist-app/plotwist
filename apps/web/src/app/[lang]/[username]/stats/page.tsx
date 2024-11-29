import { TotalHours } from './_total_hours'
import { Genres } from './_genres'
import { MostWatchedTv } from './_most_watched_tv'
import { Reviews } from './_reviews'
import { TopActors } from './_top_actors'
import { Countries } from './_countries'
import { BestRated } from './_best_rated'
import { Status } from './_status'
import { Suspense } from 'react'

export default function StatsPage() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Suspense fallback={<p>carregando...</p>}>
        <TotalHours />
      </Suspense>

      {/* <Reviews />
      <MostWatchedTv />
      <Genres />
      <TopActors />
      <Countries />
      <BestRated />
      <Status /> */}
    </div>
  )
}
