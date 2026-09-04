import type { Metadata } from 'next'
import type { PageProps } from '@/types/languages'
import { getDictionary } from '@/utils/dictionaries'
import { TogetherRoom } from '../_components/together-room'

export async function generateMetadata(
  props: PageProps<{ code: string }>
): Promise<Metadata> {
  const params = await props.params
  const dictionary = await getDictionary(params.lang)

  return {
    title: `${dictionary.together.title} • Plotwist`,
    description: dictionary.together.join_subtitle,
  }
}

export default async function TogetherRoomPage(
  props: PageProps<{ code: string }>
) {
  const { code } = await props.params
  return <TogetherRoom code={code} />
}
