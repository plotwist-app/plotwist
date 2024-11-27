import { getUserStatsId } from '@/api/user-stats'
import type { Dictionary } from '@/utils/dictionaries'
import NumberFlow from '@number-flow/react'

type UserResumeStatsProps = { dictionary: Dictionary; userId: string }

export async function UserResumeStats({
  dictionary,
  userId,
}: UserResumeStatsProps) {
  const stats = await getUserStatsId(userId)

  return (
    <div className="grid grid-cols-4 my-2 whitespace-nowrap">
      <div className="border-r pr-4">
        <NumberFlow
          value={stats.followersCount}
          className="font-bold text-lg"
        />

        <p className="text-[10px] text-muted-foreground">
          {dictionary.followers}
        </p>
      </div>

      <div className="border-r px-4">
        <NumberFlow
          value={stats.followingCount}
          className="font-bold text-lg"
        />

        <p className="text-[10px] text-muted-foreground">
          {dictionary.following}
        </p>
      </div>

      <div className="border-r px-4">
        <NumberFlow
          value={stats.watchedMoviesCount}
          className="font-bold text-lg"
        />

        <p className="text-[10px] text-muted-foreground">{dictionary.movies}</p>
      </div>

      <div className="pl-4">
        <NumberFlow
          value={stats.watchedSeriesCount}
          className="font-bold text-lg"
        />

        <p className="text-[10px] text-muted-foreground">
          {dictionary.tv_series}
        </p>
      </div>
    </div>
  )
}
