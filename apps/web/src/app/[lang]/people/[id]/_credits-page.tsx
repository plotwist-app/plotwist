'use client'

import { PosterCard } from '@/components/poster-card'
import { useLanguage } from '@/context/language'
import { tmdbImage } from '@/utils/tmdb/image'
import { getJobLabel } from '@/utils/tmdb/job'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@plotwist/ui/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@plotwist/ui/components/ui/tooltip'
import type { MovieCast, MovieCrew, TvCast, TvCrew } from '@plotwist_app/tmdb'
import Link from 'next/link'
import { useQueryState } from 'nuqs'

type CreditsPageProps = {
  roles: string[]
  credits: Array<MovieCast | MovieCrew | TvCast | TvCrew>
}

export function CreditsPage({ roles, credits }: CreditsPageProps) {
  const { language, dictionary } = useLanguage()
  const [selectedRole, setSelectedRole] = useQueryState('role', {
    defaultValue: roles[0],
  })

  const filteredCredits = credits.filter(credit => {
    if (selectedRole === 'Actor') {
      return 'character' in credit
    }

    if (selectedRole) {
      return (
        ('job' in credit && credit.job === selectedRole) ||
        ('department' in credit && credit.department === selectedRole)
      )
    }

    return true
  })

  return (
    <div>
      <Select
        onValueChange={value => setSelectedRole(value)}
        value={selectedRole}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Theme" />
        </SelectTrigger>

        <SelectContent>
          {roles.map(role => (
            <SelectItem value={role} key={role}>
              {getJobLabel(dictionary, role)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="grid grid-cols-3 lg:grid-cols-5 gap-2 mt-2">
        {filteredCredits.map(credit => {
          const href = `/${language}/${'title' in credit ? 'movies' : 'tv-series'}/${credit.id}`

          const title = 'title' in credit ? credit.title : credit.name
          const role = 'character' in credit ? credit.character : credit.job

          return (
            <TooltipProvider key={credit.credit_id}>
              <Tooltip>
                <TooltipTrigger>
                  <PosterCard.Root>
                    <Link href={href}>
                      {credit.poster_path && (
                        <PosterCard.Image
                          src={tmdbImage(credit.poster_path)}
                          alt={credit.overview}
                        />
                      )}
                    </Link>
                  </PosterCard.Root>
                </TooltipTrigger>

                <TooltipContent>
                  <p>
                    {title} {dictionary.as} {getJobLabel(dictionary, role)}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )
        })}
      </div>
    </div>
  )
}
