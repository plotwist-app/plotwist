import { selectUserItem } from '@/infra/db/repositories/user-item-repository'

export type GetUserItemInput = {
  tmdbId: number
  mediaType: 'TV_SHOW' | 'MOVIE'
  userId: string
}

export async function getUserItemService(input: GetUserItemInput) {
  const [userItem] = await selectUserItem(input)

  return { userItem }
}
