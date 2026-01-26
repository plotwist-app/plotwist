import { tmdb } from '@/services/tmdb'
import type { Language } from '@/types/languages'
import { getDictionary } from '@/utils/dictionaries'
import { getDepartmentLabel } from '@/utils/tmdb/department'
import { CreditCard } from './credit-card'

type BaseCreditsProps = {
  id: number
  language: Language
}

type MovieOrTVCreditsProps = BaseCreditsProps & {
  variant: 'movie' | 'tv'
}

type SeasonCreditsProps = BaseCreditsProps & {
  variant: 'season'
  seasonNumber: number
}

type EpisodeCreditsProps = BaseCreditsProps & {
  variant: 'episode'
  seasonNumber: number
  episodeNumber: number
}

export type CreditsProps =
  | MovieOrTVCreditsProps
  | SeasonCreditsProps
  | EpisodeCreditsProps

function getCredits(props: CreditsProps) {
  const { variant, id, language } = props

  if (variant === 'season') {
    const { seasonNumber } = props

    return tmdb.season.credits(id, seasonNumber)
  }

  if (variant === 'episode') {
    const { seasonNumber, episodeNumber } = props
    return tmdb.episodes.credits(id, seasonNumber, episodeNumber)
  }

  return tmdb.credits(variant === 'tv' ? 'tv' : 'movie', id, language)
}

export const Credits = async (props: CreditsProps) => {
  const { language } = props

  const { cast, crew } = await getCredits(props)
  const dictionary = await getDictionary(language)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <section className="">
        <h5 className="text-lg font-medium">{dictionary.credits.cast}</h5>

        <ul className="">
          {cast.map(
            (
              {
                profile_path: profilePath,
                name,
                character,
                credit_id: creditId,
                id,
              },
              index,
              array
            ) => (
              <CreditCard
                key={creditId}
                isLast={index === array.length - 1}
                imagePath={profilePath}
                name={name}
                role={character}
                href={`/${language}/people/${id}`}
              />
            )
          )}
        </ul>
      </section>

      <section className="">
        <h5 className="text-lg font-medium">{dictionary.credits.crew}</h5>

        <ul className="">
          {crew.map(
            (
              {
                profile_path: profilePath,
                name,
                department,
                credit_id: creditId,
                id,
              },
              index,
              array
            ) => (
              <CreditCard
                key={creditId}
                isLast={index === array.length - 1}
                imagePath={profilePath}
                name={name}
                role={getDepartmentLabel(dictionary, department)}
                href={`/${language}/people/${id}`}
              />
            )
          )}
        </ul>
      </section>
    </div>
  )
}
