import { Header } from '@/components/header'
import { MoviesList } from '@/components/movies-list'
import { PeopleList } from '@/components/people-list'
import { TvShowsList } from '@/components/tv-shows-list'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <main className="max-w-article mx-auto p-4">
      <Header />

      <section className="h-[50vh] flex items-center">
        <div className="flex  flex-col w-1/2">
          <div className="w-1/4 bg-muted h-4 mb-4 rounded-sm" />

          <h1 className="font-bold text-3xl">
            Explore movies, TV shows e people!
          </h1>

          <p className="text-muted-foreground">
            TMDB is for cinema fans who like to explore millions of movies and
            series, with information such as synopsis, cast, budget and much
            more.{' '}
          </p>

          <div className="mt-2 flex gap-2">
            <Button variant="outline">Start now</Button>
            <Button>Read more</Button>
          </div>
        </div>
      </section>

      <div className="space-y-12">
        <MoviesList variant="topRated" />
        <TvShowsList variant="topRated" />
        <PeopleList variant="popular" />
      </div>
    </main>
  )
}
