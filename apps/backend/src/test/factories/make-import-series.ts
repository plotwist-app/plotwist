import type { ImportStatusEnum } from '@/@types/import-item-status-enum'
import type { UserItemStatus } from '@/@types/item-status-enum'
import type { InsertImportSeries } from '@/domain/entities/import-series'

import { faker } from '@faker-js/faker'

type Overrides = Partial<InsertImportSeries>

export function makeRawImportSeries(overrides: Overrides): InsertImportSeries {
  const params = buildItemType()
  return {
    ...params,
    name: faker.book.title(),
    __metadata: buildMetadata(),
    ...overrides,
  }
}

export function makeManyRawImportSeries(
  quantity: number,
  overrides: Overrides
) {
  const series = []
  for (let i = 0; i < quantity; i++) {
    const movie = makeRawImportSeries(overrides)
    series.push(movie)
  }

  return series
}

function buildItemType() {
  const importStatus: ImportStatusEnum = faker.helpers.arrayElement([
    'COMPLETED',
    'FAILED',
    'NOT_STARTED',
  ])

  const userItemStatus: UserItemStatus = faker.helpers.arrayElement([
    'WATCHLIST',
    'WATCHED',
    'WATCHING',
    'DROPPED',
  ])

  const seriesEpisodes = faker.helpers.rangeToNumber({
    min: 2,
    max: 300,
  })

  let watchedEpisodes = faker.helpers.rangeToNumber({
    min: 0,
    max: seriesEpisodes,
  })

  if (userItemStatus === 'WATCHLIST') {
    watchedEpisodes = 0
  }

  if (userItemStatus === 'WATCHED') {
    watchedEpisodes = seriesEpisodes
  }

  return {
    seriesEpisodes,
    watchedEpisodes,
    userItemStatus,
    importStatus,
  }
}

function buildMetadata() {
  return {
    series_animedb_id: 52034,
    series_title: '"Oshi no Ko"',
    series_type: 'TV',
    series_episodes: 11,
    my_id: 0,
    my_watched_episodes: 11,
    my_start_date: '2023-07-13',
    my_finish_date: '2023-07-13',
    my_rated: '',
    my_score: 10,
    my_storage: '',
    my_storage_value: 0,
    my_status: 'Completed',
    my_comments: '',
    my_times_watched: 0,
    my_rewatch_value: '',
    my_priority: 'LOW',
    my_tags: '',
    my_rewatching: 0,
    my_rewatching_ep: 0,
    my_discuss: 1,
    my_sns: 'default',
    update_on_import: 0,
  }
}
