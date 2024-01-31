import { PageProps } from '@/types/languages'
import { TvShowList } from '../../components/tv-show-list'
import { getDictionary } from '@/utils/dictionaries'

const AiringTodayTvShowsPage = async ({ params: { lang } }: PageProps) => {
  const {
    tv_show_pages: {
      airing_today: { title, description },
    },
  } = await getDictionary(lang)

  return (
    <div className="mx-auto max-w-5xl space-y-4 px-4 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>

      <TvShowList variant="airing_today" language={lang} />
    </div>
  )
}

export default AiringTodayTvShowsPage
