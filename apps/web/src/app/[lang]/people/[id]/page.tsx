import { tmdb } from '@/services/tmdb'
import type { PageProps } from '@/types/languages'
import { CreditsPage } from './_credits-page'

type Props = PageProps<{ id: string }>

export default async function Page({ params }: Props) {
  const { id, lang } = await params

  const movieCredits = await tmdb.person.movieCredits(Number(id), lang)
  const tvCredits = await tmdb.person.tvCredits(Number(id), lang)

  const credits = [
    ...movieCredits.cast,
    ...movieCredits.crew,
    ...tvCredits.cast,
    ...tvCredits.crew,
  ]
    .sort((a, b) => b.vote_count - a.vote_count)
    .filter(({ poster_path }) => poster_path)

  const uniqueRoles = new Set<string>()

  for (const credit of credits) {
    if ('job' in credit) {
      uniqueRoles.add(credit.job)
    }

    if ('character' in credit) {
      uniqueRoles.add('Actor')
    }
  }

  return <CreditsPage roles={Array.from(uniqueRoles)} credits={credits} />
}
