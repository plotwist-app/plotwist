import type { Metadata } from 'next'
import { WelcomeScreen } from '@/components/welcome-screen'
import { getDictionary } from '@/dictionaries'
import { buildWelcomeMetadata } from '@/lib/metadata'
import type { PageProps } from '@/types/languages'

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { lang } = await props.params
  const dictionary = await getDictionary(lang)

  return buildWelcomeMetadata(lang, dictionary)
}

export default function TogetherPage() {
  return <WelcomeScreen />
}
