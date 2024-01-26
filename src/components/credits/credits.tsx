import { tmdb } from '@/services/tmdb2'
import { CreditCard } from './credit-card'
import { getDictionary } from '@/utils/dictionaries'
import { Language } from '@/types/languages'

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
      </section>

      <section className="space-y-2">
        <h5 className="text-xl font-bold">{dictionary.credits.crew}</h5>

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
      </section>
    </div>
  )
}
