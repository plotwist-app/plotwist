import { getDictionary } from '@/utils/dictionaries'
import { PageProps } from '@/types/languages'
import { TvShowsList } from '@/components/tv-shows-list'
import { Metadata } from 'next'

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const {
    tv_show_pages: {
      popular: { title, description },
    },
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

const PopularTvShowsPage = async ({ params: { lang } }: PageProps) => {
  const {
    tv_show_pages: {
      popular: { title, description },
    },
  } = await getDictionary(lang)

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>

      <TvShowsList variant="popular" />
    </div>
  )
}

export default PopularTvShowsPage
