import NumberFlow from '@number-flow/react'
import { getUserIdStats } from '@/api/user-stats'
import { cn } from '@/lib/utils'
import type { Dictionary } from '@/utils/dictionaries'
import { UserFollows } from './user-follows'

type UserResumeStatsProps = { dictionary: Dictionary; userId: string }

export async function UserResumeStats({
  dictionary,
  userId,
}: UserResumeStatsProps) {
  const {
    followersCount,
    followingCount,
    watchedMoviesCount,
    watchedSeriesCount,
  } = await getUserIdStats(userId)

  return (
    <div className="grid grid-cols-4 my-2 whitespace-nowrap">
      <UserFollows variant="followers" userId={userId} count={followersCount}>
        <div
          className={cn(
            'border-r pr-4 cursor-pointer',
            followersCount === 0 && 'pointer-events-none'
          )}
        >
          <NumberFlow value={followersCount} className="font-bold text-lg" />
          <p className="text-[10px] text-muted-foreground">
            {dictionary.followers}
          </p>
        </div>
      </UserFollows>

      <UserFollows variant="following" userId={userId} count={followingCount}>
        <div
          className={cn(
            'border-r px-4 cursor-pointer',
            followingCount === 0 && 'pointer-events-none'
          )}
        >
          <NumberFlow value={followingCount} className="font-bold text-lg" />
          <p className="text-[10px] text-muted-foreground">
            {dictionary.following}
          </p>
        </div>
      </UserFollows>

      <div className="border-r px-4">
        <NumberFlow value={watchedMoviesCount} className="font-bold text-lg" />

        <p className="text-[10px] text-muted-foreground">{dictionary.movies}</p>
      </div>

      <div className="pl-4">
        <NumberFlow value={watchedSeriesCount} className="font-bold text-lg" />

        <p className="text-[10px] text-muted-foreground">
          {dictionary.tv_series}
        </p>
      </div>
    </div>
  )
}
