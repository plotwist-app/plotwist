import { CreditCard } from '@/components/credit-card'
import { TMDB } from '@/services/TMDB'

type TvShowCreditsProps = { tvShowID: number }

export const TvShowCredits = async ({ tvShowID }: TvShowCreditsProps) => {
  const { cast, crew } = await TMDB.tvShows.credits(tvShowID)

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h5 className="text-xl font-bold">Cast</h5>

        <div className="grid grid-cols-6 gap-4">
          {cast.map(({ profile_path: profilePath, name, id, character }) => (
            <CreditCard
              key={id}
              imagePath={profilePath}
              name={name}
              role={character}
              href={`/app/people/${id}`}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h5 className="text-xl font-bold">Crew</h5>

        <div className="grid grid-cols-6 gap-4">
          {crew.map(({ profile_path: profilePath, name, id, department }) => (
            <CreditCard
              key={id}
              imagePath={profilePath}
              name={name}
              role={department}
              href={`/app/people/${id}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
