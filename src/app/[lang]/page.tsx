import { Header } from '@/components/header'
import { MoviesList } from '@/components/movies-list'
import { Button } from '@/components/ui/button'
import { PageParams } from '@/types/languages'
import { getDictionary } from '@/utils/dictorionaries'
import Link from 'next/link'

export default async function Home({ params: { lang } }: PageParams) {
  const dictionary = await getDictionary(lang)

  return (
    <main className="mx-auto max-w-article p-4">
      <Header />

      <section className="flex h-[75vh] items-center md:h-[50vh]">
        <div className="flex flex-col space-y-2 md:w-1/2">
          <div className="mb-4 h-4 w-1/4 rounded-sm bg-muted" />

          <h1 className="text-3xl font-bold">{dictionary.home.title}</h1>
          <p className="text-muted-foreground">{dictionary.home.description}</p>

          <div className="mt-2 flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/login">{dictionary.home.start}</Link>
            </Button>

            <Button>{dictionary.home.read_more}</Button>
          </div>
        </div>
      </section>

      <div className="space-y-12">
        <MoviesList list="top_rated" lang={lang} />
      </div>
    </main>
  )
}
