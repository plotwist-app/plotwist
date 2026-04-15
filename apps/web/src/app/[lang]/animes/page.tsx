import type { Metadata } from 'next'
import { AnimeList } from '@/components/animes-list'
import type { PageProps } from '@/types/languages'
import { getDictionary } from '@/utils/dictionaries'
import { buildLanguageAlternates } from '@/utils/seo'
import { Container } from '../_components/container'

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { lang } = await props.params
  const { animes_page } = await getDictionary(lang)

  const title = animes_page.title
  const description = animes_page.description

  return {
    title: `${title} • Plotwist`,
    description,
    openGraph: {
      title: `${title} • Plotwist`,
      description,
      siteName: 'Plotwist',
    },
    twitter: {
      title: `${title} • Plotwist`,
      description,
    },
    alternates: buildLanguageAlternates(lang, '/animes'),
  }
}

export default async function DiscoverMoviesPage(props: PageProps) {
  const { lang } = await props.params
  const dictionary = await getDictionary(lang)

  return (
    <Container>
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">{dictionary.animes_page.title}</h1>
          <p className="text-muted-foreground">
            {dictionary.animes_page.description}
          </p>
        </div>
      </div>

      <AnimeList />
    </Container>
  )
}
