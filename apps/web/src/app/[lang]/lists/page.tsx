import type { Metadata } from 'next'

import type { PageProps } from '@/types/languages'
import { getDictionary } from '@/utils/dictionaries'
import { Separator } from '@plotwist/ui/components/ui/separator'
import { Container } from '../_components/container'
import { LatestLists } from './_components/latest-lists'
import { Lists } from './_components/lists'
import { SeeAllLists } from './_components/see-all-lists'

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params
  const dictionary = await getDictionary(params.lang)
  const title = dictionary.lists
  const description = dictionary.manage_your_lists

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
  }
}

const ListsPage = async (props: PageProps) => {
  const params = await props.params

  const { lang } = params

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

      <div className="space-y-8 min-h-screen">
        <div className="flex flex-col space-y-4">
          <Lists />
          <SeeAllLists className="block text-end md:hidden" />
        </div>

        <Separator />

        <div className="grid grid-cols-3 gap-16">
          <section className="col-span-3 lg:col-span-2">
            <LatestLists />
          </section>
        </div>
      </div>
    </Container>
  )
}

export default ListsPage
