import { tmdb } from '@/services/tmdb'
import type { Language } from '@/types/languages'
import { getDictionary } from '@/utils/dictionaries'
import { CreditCard } from './credit-card'
import { getDepartamentLabel } from '@/utils/tmdb/department'

export type CreditsProps = {
  variant: 'movie' | 'tv'
  id: number
  language: Language
}

export const Credits = async ({ variant, id, language }: CreditsProps) => {
  const { cast, crew } = await tmdb.credits(variant, id, language)
  const dictionary = await getDictionary(language)

  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      data-testid="credits"
    >
      <section className="">
        <h5 className="text-lg font-medium">{dictionary.credits.cast}</h5>

        <ul className="">
          {cast.map(
            ({
              profile_path: profilePath,
              name,
              character,
              credit_id: creditId,
              id,
            }) => (
              <CreditCard
                key={creditId}
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
            ({
              profile_path: profilePath,
              name,
              department,
              credit_id: creditId,
              id,
            }) => (
              <CreditCard
                key={creditId}
                imagePath={profilePath}
                name={name}
                role={getDepartamentLabel(dictionary, department)}
                href={`/${language}/people/${id}`}
              />
            )
          )}
        </ul>
      </section>
    </div>
  )
}
