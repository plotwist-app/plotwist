import type { Metadata } from 'next'
import type { PropsWithChildren } from 'react'
import type { PageProps } from '@/types/languages'
import { getDictionary } from '@/utils/dictionaries'

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params
  const { lang } = params
  const dictionary = await getDictionary(lang)

  return {
    title: `${dictionary.privacy_policy} • Plotwist`,
    description: 'Privacy Policy for Plotwist',
    openGraph: {
      title: `${dictionary.privacy_policy} • Plotwist`,
      description: 'Privacy Policy for Plotwist',
      siteName: 'Plotwist',
    },
    twitter: {
      title: `${dictionary.privacy_policy} • Plotwist`,
      description: 'Privacy Policy for Plotwist',
    },
  }
}

export default function PrivacyLayout({ children }: PropsWithChildren) {
  return (
    <div className="mx-auto max-w-3xl px-4 xl:px-0">
      <main className="prose prose-zinc min-w-0 max-w-full flex-1 pb-16 pt-8 dark:prose-invert prose-h1:text-2xl prose-h1:font-semibold prose-h2:text-xl prose-h2:font-medium prose-h3:text-base prose-h3:font-medium prose-strong:font-medium">
        {children}
      </main>
    </div>
  )
}
