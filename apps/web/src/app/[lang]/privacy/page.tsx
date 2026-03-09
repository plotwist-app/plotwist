import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { PageProps } from '@/types/languages'
import { buildLanguageAlternates } from '@/utils/seo'

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { lang } = await props.params
  return {
    title: 'Privacy Policy • Plotwist',
    alternates: buildLanguageAlternates(lang, '/privacy'),
  }
}

export default async function PrivacyPage(props: PageProps) {
  const params = await props.params
  try {
    const Content = (await import(`./_content/${params.lang}.mdx`)).default
    return <Content />
  } catch {
    try {
      const Content = (await import('./_content/en-US.mdx')).default
      return <Content />
    } catch {
      notFound()
    }
  }
}
