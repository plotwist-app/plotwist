import Link from 'next/link'

import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { getUserService } from '@/services/api/users/get-user'
import { supabase } from '@/services/supabase'
import { PageProps } from '@/types/languages'
import { getDictionary } from '@/utils/dictionaries'

export default async function Home({ params: { lang } }: PageProps) {
  const dictionary = await getDictionary(lang)
  const {
    data: { user },
  } = await getUserService()

  const { data } = await supabase
    .from('user_count')
    .select()
    .single<{ user_count: number }>()

  return (
    <main className="mx-auto max-w-article p-4">
      <Header />

      <section className="flex h-[75vh] items-center md:h-[50vh]">
        <div className="mx-auto flex w-4/5 flex-col items-center justify-center space-y-4 text-center">
          <h1 className="text-5xl font-bold">{dictionary.home.title}</h1>

          <p className=" leading-6 text-muted-foreground">
            {dictionary.home.description}
          </p>

          <div className="mt-2 flex gap-2">
            <Button variant="outline" asChild>
              {user ? (
                <Link href={`/${lang}/app`}>
                  {dictionary.home.primary_button}
                </Link>
              ) : (
                <Link href={`/${lang}/login`}>
                  {dictionary.home.primary_button}
                </Link>
              )}
            </Button>

            <Button asChild>
              <Link href={`/${lang}/signup`}>
                {dictionary.home.secondary_button}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="space-y-8">
        <div className="aspect-video w-full rounded-md bg-muted shadow-sm" />

        <div className="grid grid-cols-4 items-center gap-4">
          <div className="relative flex flex-col items-center space-y-1 text-center">
            <div className="absolute right-0 top-[25%] h-8 border-r border-dashed" />

            <span className="text-3xl font-bold">
              {dictionary.home.statistics.movies.value}
            </span>
            <p className="text-xs text-muted-foreground">
              {dictionary.home.statistics.movies.label}
            </p>
          </div>

          <div className="relative flex flex-col items-center space-y-1 text-center after:content-[😀]">
            <div className="absolute right-0 top-[25%] h-8 border-r border-dashed" />

            <span className="text-3xl font-bold">
              {dictionary.home.statistics.tv.value}
            </span>

            <p className="text-xs text-muted-foreground">
              {dictionary.home.statistics.tv.label}
            </p>
          </div>

          <div className="relative flex flex-col items-center space-y-1 text-center">
            <div className="absolute right-0 top-[25%] h-8 border-r border-dashed" />

            <span className="text-3xl font-bold">
              {dictionary.home.statistics.people.value}
            </span>

            <p className="text-xs text-muted-foreground">
              {dictionary.home.statistics.people.label}
            </p>
          </div>

          <div className="relative flex flex-col items-center space-y-1 text-center">
            <span className="text-3xl font-bold">+{data?.user_count ?? 0}</span>
            <p className="text-xs text-muted-foreground">
              {dictionary.home.statistics.users.label}
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
