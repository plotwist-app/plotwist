import { CreditCard } from './credit-card'
import { getDictionary } from '@/utils/dictionaries'
import { Language } from '@/types/languages'
import { tmdb } from '@plotwist/tmdb'

export type CreditsProps = {
  variant: 'movie' | 'tv'
  id: number
  language: Language
}

export const Credits = async ({ variant, id, language }: CreditsProps) => {
  const { cast, crew } = await tmdb.credits(variant, id, language)
  const dictionary = await getDictionary(language)

  return (
    <div className="space-y-8" data-testid="credits">
      <section className="space-y-2">
        <h5 className="text-xl font-bold">{dictionary.credits.cast}</h5>

        <div className="grid grid-cols-3 gap-4 md:grid-cols-6">
          {cast.map(
            ({
              profile_path: profilePath,
              name,
              id,
              character,
              credit_id: creditId,
            }) => (
              <CreditCard
                key={creditId}
                imagePath={profilePath}
                name={name}
                role={character}
                href={`/${language}/people/${id}`}
              />
            ),
          )}
        </div>
      </section>

      <section className="space-y-2">
        <h5 className="text-xl font-bold">{dictionary.credits.crew}</h5>

        <div className="grid grid-cols-3 gap-4 md:grid-cols-6">
          {crew.map(
            ({
              profile_path: profilePath,
              name,
              id,
              department,
              credit_id: creditId,
            }) => (
              <CreditCard
                key={creditId}
                imagePath={profilePath}
                name={name}
                role={department}
                href={`/${language}/people/${id}`}
              />
            ),
          )}
        </div>
      </section>
    </div>
  )
}
