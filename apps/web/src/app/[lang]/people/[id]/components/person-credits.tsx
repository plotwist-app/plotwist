'use client'

import { tmdb } from '@plotwist/tmdb'
import { useQuery } from '@tanstack/react-query'

import { useLanguage } from '@/context/language'

import { DataTable } from './data-table'
import { columns } from './data-table/data-table-columns'

type PersonCreditsProps = { personId: number }

export const PersonCredits = ({ personId }: PersonCreditsProps) => {
  const { dictionary, language } = useLanguage()

  const { data } = useQuery({
    queryKey: [personId],
    queryFn: () => tmdb.person.combinedCredits(personId, language),
  })

  if (!data) return <></>

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
    </div>
  )
}
