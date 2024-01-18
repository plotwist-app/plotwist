import { Header } from '@/components/header'
import { MoviesList } from '@/components/movies-list'
import { Button } from '@/components/ui/button'
import { PageParams } from '@/types/languages'
import { getDictionary } from '@/utils/dictionaries'
import Link from 'next/link'

export default async function Home({ params: { lang } }: PageParams) {
  const dictionary = await getDictionary(lang)

  return (
    <main className="mx-auto max-w-article p-4">
      <Header />

      <section className="flex h-[75vh] items-center md:h-[50vh]">
        <div className="flex flex-col space-y-2 md:w-1/2">
          <h1 className="text-3xl font-bold">{dictionary.home.title}</h1>
          <p className="text-muted-foreground">{dictionary.home.description}</p>

          <div className="mt-2 flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/${lang}/login`}>{dictionary.home.start}</Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="space-y-12">
        <MoviesList list="top_rated" language={lang} />
      </div>
    </main>
  )
}
