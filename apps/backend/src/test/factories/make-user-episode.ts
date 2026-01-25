import { faker } from '@faker-js/faker'
import { insertUserEpisodes } from '@/db/repositories/user-episode'
import type { InsertUserEpisode } from '@/domain/entities/user-episode'

type Overrides = Partial<InsertUserEpisode> & {
  userId: string
}

export function makeRawUserEpisode(overrides: Overrides): InsertUserEpisode {
  return {
    episodeNumber: faker.number.int({ min: 1, max: 24 }),
    seasonNumber: faker.number.int({ min: 1, max: 15 }),
    tmdbId: faker.number.int({ min: 1, max: 1000 }),
    ...overrides,
  }
}

export async function makeUserEpisode(overrides: Overrides) {
  const [userEpisode] = await insertUserEpisodes([
    makeRawUserEpisode(overrides),
  ])

  return userEpisode
}
