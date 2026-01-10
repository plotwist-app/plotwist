'use client'

import { Badge } from '@plotwist/ui/components/ui/badge'
import type { PersonDetails } from '@plotwist_app/tmdb'
import { format } from 'date-fns'
import { useLanguage } from '@/context/language'
import { locale } from '@/utils/date/locale'
import { getDepartmentLabel } from '@/utils/tmdb/department'

type InfosProps = {
  personDetails: PersonDetails
  creditsCount: number
}

export function Infos({ personDetails, creditsCount }: InfosProps) {
  const { language, dictionary } = useLanguage()

  const {
    known_for_department,
    also_known_as,
    gender,
    birthday,
    place_of_birth,
  } = personDetails

  const getGenderLabel = (gender: number) => {
    switch (gender) {
      case 1:
        return dictionary.female
      case 2:
        return dictionary.male
      default:
        return dictionary.not_specified
    }
  }

  const calculateAge = (birthday: string) => {
    const birthDate = new Date(birthday)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--
    }

    return age
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between gap-4">
        <h2 className="text-sm font-semibold">{dictionary.known_for}</h2>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">
            {getDepartmentLabel(dictionary, known_for_department)}
          </Badge>
        </div>
      </div>

      <div className="flex justify-between gap-4">
        <h2 className="text-sm font-semibold">{dictionary.credits_count}</h2>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{creditsCount}</Badge>
        </div>
      </div>

      <div className="flex justify-between gap-4">
        <h2 className="text-sm font-semibold">{dictionary.gender}</h2>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{getGenderLabel(gender)}</Badge>
        </div>
      </div>

      {birthday && (
        <div className="flex justify-between gap-4">
          <h2 className="text-sm font-semibold whitespace-nowrap">
            {dictionary.birthdate}
          </h2>

          <div className="flex flex-col gap-0 text-xs text-muted-foreground text-right">
            <span>
              {format(new Date(birthday), "dd 'de' MMMM 'de' yyyy", {
                locale: locale[language],
              })}{' '}
              ({calculateAge(birthday)} anos)
            </span>

            {place_of_birth && <span>{place_of_birth}</span>}
          </div>
        </div>
      )}

      {also_known_as.length > 0 && (
        <div className="flex justify-between gap-4">
          <h2 className="text-sm font-semibold whitespace-nowrap">
            {dictionary.also_known_as}
          </h2>

          <div className="flex flex-wrap gap-2 justify-end">
            {also_known_as.map(name => (
              <Badge key={name} variant="outline">
                {name}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
