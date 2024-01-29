'use client'

import { tmdb } from '@/services/tmdb'
import { Language } from '@/types/languages'
import { DataTable } from './data-table'
import { columns } from './data-table/data-table-columns'
import { useQuery } from '@tanstack/react-query'
import { useLanguage } from '@/context/language'

type PersonCreditsProps = { personId: number }

export const PersonCredits = ({ personId }: PersonCreditsProps) => {
  const { dictionary, language } = useLanguage()

  const { data } = useQuery({
    queryKey: [personId],
    queryFn: () => tmdb.person.combinedCredits(personId, language),
  })

  if (!data) return <>deu merda negao</>

  return (
    <div className="space-y-8" data-testid="credits">
      <section className="space-y-2">
        <h5 className="text-xl font-bold">{dictionary.credits.cast}</h5>

        <DataTable columns={columns(dictionary, language)} data={data.cast} />
      </section>

      <section className="space-y-2">
        <h5 className="text-xl font-bold">{dictionary.credits.crew}</h5>
        <DataTable columns={columns(dictionary, language)} data={data.crew} />
      </section>

      {/* <section className="space-y-2">
        <h5 className="text-xl font-bold">{dictionary.credits.crew}</h5>

        <div className="grid grid-cols-6 gap-4">
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
                href={`/${language}/app/people/${id}`}
              />
            ),
          )}
        </div>
      </section> */}
    </div>
  )
}
