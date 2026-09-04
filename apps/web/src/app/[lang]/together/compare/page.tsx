import type { Metadata } from 'next'
import type { PageProps } from '@/types/languages'
import { getDictionary } from '@/utils/dictionaries'
import { TogetherCompare } from '../_components/together-compare'

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params
  const dictionary = await getDictionary(params.lang)

  return {
    title: `Violet vs Butter vs Coral • ${dictionary.together.title}`,
    robots: { index: false, follow: false },
  }
}

export default function TogetherComparePage() {
  return <TogetherCompare />
}
