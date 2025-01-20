import { tmdb } from '@/services/tmdb'

const DEFAULT_PAGES = 10

export const getTvSeriesIds = async (pages: number = DEFAULT_PAGES) => {
  const types = ['airing_today', 'on_the_air', 'popular', 'top_rated'] as const

  const lists = await Promise.all(
    Array.from({ length: pages }).map(
      async (_, index) =>
        await Promise.all(
          types.map(
            async type =>
              await tmdb.tv.list({
                language: 'en-US',
                list: type,
                page: index + 1,
              })
          )
        )
    )
  )
  const results = lists.flatMap(list => list.map(list => list.results))
  const ids = results.flatMap(result => result.map(tv => tv.id))

  const uniqueIds = Array.from(new Set(ids))

  return uniqueIds
}
