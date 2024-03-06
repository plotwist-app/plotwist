import { PageProps } from '@/types/languages'
import { Lists } from './_components/lists'
import { getDictionary } from '@/utils/dictionaries'
import { Metadata } from 'next'

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
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>

      <Lists />
    </div>
  )
}

export default ListsPage
