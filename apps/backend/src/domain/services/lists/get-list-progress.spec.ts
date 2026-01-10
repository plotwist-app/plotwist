import { describe, expect, it } from 'vitest'
import { makeUser } from '@/test/factories/make-user'
import { makeList } from '@/test/factories/make-list'
import { makeListItem } from '@/test/factories/make-list-item'
import { makeUserItem } from '@/test/factories/make-user-item'
import { getListProgressService } from './get-list-progress'

describe('get list progress', () => {
  it('should return zero progress when list has no items', async () => {
    const user = await makeUser()
    const list = await makeList({ userId: user.id })

    const sut = await getListProgressService({
      id: list.id,
      authenticatedUserId: user.id,
    })

    expect(sut).toEqual({
      total: 0,
      completed: 0,
      percentage: 0,
    })
  })

  it('should calculate correct progress when user has watched some items', async () => {
    const user = await makeUser()
    const list = await makeList({ userId: user.id })

    const listItem1 = await makeListItem({
      listId: list.id,
      tmdbId: 123,
      mediaType: 'MOVIE',
    })

    await makeListItem({
      listId: list.id,
      tmdbId: 456,
      mediaType: 'MOVIE',
    })

    await makeUserItem({
      userId: user.id,
      tmdbId: listItem1.tmdbId,
      mediaType: listItem1.mediaType,
      status: 'WATCHED',
    })

    const sut = await getListProgressService({
      id: list.id,
      authenticatedUserId: user.id,
    })

    expect(sut).toEqual({
      total: 2,
      completed: 1,
      percentage: 50,
    })
  })

  it('should calculate 100% progress when user has watched all items', async () => {
    const user = await makeUser()
    const list = await makeList({ userId: user.id })

    const listItem1 = await makeListItem({
      listId: list.id,
      tmdbId: 123,
      mediaType: 'MOVIE',
    })
    const listItem2 = await makeListItem({
      listId: list.id,
      tmdbId: 456,
      mediaType: 'MOVIE',
    })

    await makeUserItem({
      userId: user.id,
      tmdbId: listItem1.tmdbId,
      mediaType: listItem1.mediaType,
      status: 'WATCHED',
    })
    await makeUserItem({
      userId: user.id,
      tmdbId: listItem2.tmdbId,
      mediaType: listItem2.mediaType,
      status: 'WATCHED',
    })

    const sut = await getListProgressService({
      id: list.id,
      authenticatedUserId: user.id,
    })

    expect(sut).toEqual({
      total: 2,
      completed: 2,
      percentage: 100,
    })
  })

  it('should ignore user items with different media type', async () => {
    const user = await makeUser()
    const list = await makeList({ userId: user.id })

    const listItem = await makeListItem({
      listId: list.id,
      tmdbId: 123,
      mediaType: 'MOVIE',
    })

    await makeUserItem({
      userId: user.id,
      tmdbId: listItem.tmdbId,
      mediaType: 'TV_SHOW',
      status: 'WATCHED',
    })

    const sut = await getListProgressService({
      id: list.id,
      authenticatedUserId: user.id,
    })

    expect(sut).toEqual({
      total: 1,
      completed: 0,
      percentage: 0,
    })
  })
})
