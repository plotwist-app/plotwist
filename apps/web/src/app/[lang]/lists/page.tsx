import { Metadata } from 'next'

import { Lists } from './_components/lists'
import { Container } from '../_components/container'

import { PageProps } from '@/types/languages'
import { getDictionary } from '@/utils/dictionaries'
import { PopularLists } from './_components/popular-lists'
import { Separator } from '@/components/ui/separator'

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">{dictionary.my_lists}</h1>
          <p className="text-muted-foreground">
            {dictionary.manage_your_lists}
          </p>
        </div>
      </div>

      <div className="space-y-8">
        <Lists />
        <Separator />

        <div className="grid grid-cols-3 gap-16">
          <section className="col-span-3 lg:col-span-2">
            <PopularLists />
          </section>

          {/* <div className="relative space-y-4">
            

            <Skeleton className="h-[3ex] w-[15ch] rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="aspect-video rounded-lg" />
              <Skeleton className="aspect-video rounded-lg" />
              <Skeleton className="aspect-video rounded-lg" />
            </div>
          </div> */}
        </div>
      </div>
    </Container>
  )
}

export default ListsPage
