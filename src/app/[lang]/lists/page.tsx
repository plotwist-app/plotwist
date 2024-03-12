import { Metadata } from 'next'

import { Lists } from './_components/lists'
import { Container } from '../_components/container'

import { PageProps } from '@/types/languages'
import { getDictionary } from '@/utils/dictionaries'

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const {
    lists_page: { title, description },
  } = await getDictionary(params.lang)

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: '[TMDB]',
    },
    twitter: {
      title,
      description,
    },
  }
}

const ListsPage = async ({ params }: PageProps) => {
  const {
    lists_page: { title, description },
  } = await getDictionary(params.lang)

  return (
    <Container>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>

      <Lists />
    </Container>
  )
}

export default ListsPage
