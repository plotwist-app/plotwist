import { faker } from '@faker-js/faker'
import type { ImportStatusEnum } from '@/@types/import-item-status-enum'
import type { UserItemStatus } from '@/@types/item-status-enum'
import type { InsertImportMovie } from '@/domain/entities/import-movies'

type Overrides = Partial<InsertImportMovie>

export function makeRawImportMovies(overrides: Overrides) {
  const params = buildItemType()
  return {
    ...params,
    name: faker.book.title(),
    __metadata: buildMetadata(),
    ...overrides,
  }
}

export function makeManyRawImportMovies(
  quantity: number,
  overrides: Overrides
) {
  const movies = []
  for (let i = 0; i < quantity; i++) {
    const movie = makeRawImportMovies(overrides)
    movies.push(movie)
  }

  return movies
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

  return {
    userItemStatus,
    importStatus,
  }
}

function buildMetadata() {
  return {
    series_animedb_id: 34437,
    series_title: 'Code Geass: Fukkatsu no Lelouch',
    series_type: 'Movie',
    series_episodes: 1,
    my_id: 0,
    my_watched_episodes: 1,
    my_start_date: '2022-12-04',
    my_finish_date: '2022-12-04',
    my_rated: '',
    my_score: 9,
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
