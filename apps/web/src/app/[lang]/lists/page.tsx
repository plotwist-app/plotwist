import { Metadata } from 'next'

import { Lists } from './_components/lists'
import { Container } from '../_components/container'
import { PageProps } from '@/types/languages'
import { getDictionary } from '@/utils/dictionaries'
import { PopularLists } from './_components/popular-lists'
import { Separator } from '@plotwist/ui/components/ui/separator'
import { SeeAllLists } from './_components/see-all-lists'

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const dictionary = await getDictionary(params.lang)
  const title = dictionary.lists
  const description = dictionary.manage_your_lists

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: 'Plotwist',
    },
    twitter: {
      title,
      description,
    },
  }
}

const ListsPage = async ({ params: { lang } }: PageProps) => {
  const dictionary = await getDictionary(lang)

  return (
    <Container>
      <div className="flex items-end justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold">{dictionary.my_lists}</h1>
          <p className="text-muted-foreground">
            {dictionary.manage_your_lists}
          </p>
        </div>

        <SeeAllLists />
      </div>

      <div className="space-y-8">
        <div className="flex flex-col space-y-4">
          <Lists />

          <SeeAllLists className="block text-end md:hidden" />
        </div>

        <Separator />

        <div className="grid grid-cols-3 gap-16">
          <section className="col-span-3 lg:col-span-2">
            <PopularLists />
          </section>
        </div>
      </div>
    </Container>
  )
}

export default ListsPage
