import type { Dictionary } from '@/utils/dictionaries'
import { getDepartmentLabel } from '@/utils/tmdb/department'
import { Badge } from '@plotwist/ui/components/ui/badge'
import type { PersonDetails } from '@plotwist_app/tmdb'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

type InfosProps = {
  personDetails: PersonDetails
  dictionary: Dictionary
  creditsCount: number
}

export function Infos({ personDetails, dictionary, creditsCount }: InfosProps) {
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
        return 'Feminino'
      case 2:
        return 'Masculino'
      default:
        return 'Não especificado'
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
        <h2 className="text-sm font-semibold">Conhecido por</h2>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">
            {getDepartmentLabel(dictionary, known_for_department)}
          </Badge>
        </div>
      </div>

      <div className="flex justify-between gap-4">
        <h2 className="text-sm font-semibold">Creditado(a) em</h2>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{creditsCount}</Badge>
        </div>
      </div>

      <div className="flex justify-between gap-4">
        <h2 className="text-sm font-semibold">Gênero</h2>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{getGenderLabel(gender)}</Badge>
        </div>
      </div>

      {birthday && (
        <div className="flex justify-between gap-4">
          <h2 className="text-sm font-semibold whitespace-nowrap">
            Nascimento
          </h2>

          <div className="flex flex-col gap-0 text-xs text-muted-foreground text-right">
            <span>
              {format(new Date(birthday), "dd 'de' MMMM 'de' yyyy", {
                locale: ptBR,
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
            Conhecido como
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
