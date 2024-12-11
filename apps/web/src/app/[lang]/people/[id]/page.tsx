import { tmdb } from '@/services/tmdb'
import type { PageProps } from '@/types/languages'

type Props = PageProps<{ id: string }>

export default async function Page({ params }: Props) {
  const { id, lang } = await params

  const { biography } = await tmdb.person.details(Number(id), lang)

  return <p className="text-muted-foreground text-sm leading-6">{biography}</p>
}
