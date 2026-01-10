import { selectLists } from '@/db/repositories/list-repository'

export type GetListsInput = {
  userId?: string
  limit?: number
  authenticatedUserId?: string
  visibility?: 'PUBLIC' | 'PRIVATE' | 'NETWORK'
  hasBanner?: boolean
}

export async function getListsServices(input: GetListsInput) {
  const lists = await selectLists(input)

  return { lists }
}
