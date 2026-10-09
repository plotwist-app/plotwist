import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { getDictionary } from '@/dictionaries'
import { buildRoomMetadata } from '@/lib/metadata'
import type { PageProps } from '@/types/languages'

export async function generateMetadata(
  props: PageProps<{ code: string }>
): Promise<Metadata> {
  const { lang } = await props.params
  const dictionary = await getDictionary(lang)

  return buildRoomMetadata(dictionary)
}

export default function TogetherRoomLayout({
  children,
}: {
  children: ReactNode
}) {
  return children
}
