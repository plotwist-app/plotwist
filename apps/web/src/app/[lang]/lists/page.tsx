import { Metadata } from 'next'

import { Lists } from './_components/lists'
import { Container } from '../_components/container'
import { PageProps } from '@/types/languages'
import { getDictionary } from '@/utils/dictionaries'
import { PopularLists } from './_components/popular-lists'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import { getUserService } from '@/services/api/users/get-user'
import { Button } from '@/components/ui/button'

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
  const user = await getUserService()

  return (
    <Container>
      <div className="flex items-end justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold">{dictionary.my_lists}</h1>
          <p className="text-muted-foreground">
            {dictionary.manage_your_lists}
          </p>
        </div>

        {user && (
          <Link
            href={`/${lang}/${user.username}?tab=lists`}
            className="hidden text-sm text-muted-foreground hover:underline md:block "
          >
            {dictionary.see_all_list}
          </Link>
        )}
      </div>

      <div className="space-y-8">
        <div className="flex flex-col space-y-4">
          <Lists />

          {user && (
            <Button asChild>
              <Link
                href={`/${lang}/${user.username}?tab=lists`}
                className="block text-sm text-muted-foreground hover:underline md:hidden "
              >
                {dictionary.see_all_list}
              </Link>
            </Button>
          )}
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
