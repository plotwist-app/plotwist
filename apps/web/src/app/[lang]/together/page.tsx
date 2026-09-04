import type { Metadata } from 'next'
import type { PageProps } from '@/types/languages'
import { getDictionary } from '@/utils/dictionaries'
import { buildLanguageAlternates } from '@/utils/seo'
import { WelcomeScreen } from './_components/welcome-screen'

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params
  const dictionary = await getDictionary(params.lang)

  return {
    title: `${dictionary.together.title} • Plotwist`,
    description: dictionary.together.subtitle,
    alternates: buildLanguageAlternates(params.lang, '/together'),
  }
}

export default function TogetherPage() {
  return <WelcomeScreen />
}
