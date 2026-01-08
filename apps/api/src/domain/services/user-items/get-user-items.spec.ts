import { makeUser } from '@/test/factories/make-user'
import { makeUserItem } from '@/test/factories/make-user-item'
import { describe, expect, it } from 'vitest'

import { db } from '@/db'
import { schema } from '@/db/schema'
import type { UserItem } from '@/domain/entities/user-item'
import { makeReview } from '@/test/factories/make-review'
import { eq } from 'drizzle-orm'
import { getUserItemsService } from './get-user-items'

describe('get user items', () => {
  it('should be able to get user items', async () => {
    const user = await makeUser()
    const userItem = await makeUserItem({ userId: user.id, status: 'WATCHED' })

    const sut = await getUserItemsService({
      status: userItem.status,
      userId: user.id,
      pageSize: 20,
      orderBy: 'updatedAt',
      orderDirection: 'desc',
      rating: [0, 5],
      mediaType: ['TV_SHOW', 'MOVIE'],
    })

    expect(sut).toEqual({
      userItems: expect.arrayContaining([
        expect.objectContaining({
          status: userItem.status,
        }),
      ]),
      nextCursor: null,
    })
  })

  it('should be able to get user items with cursor', async () => {
    const user = await makeUser()

    const userItems = await Promise.all(
      Array.from({ length: 25 }, () =>
        makeUserItem({ userId: user.id, status: 'WATCHED' })
      )
    )

    const sortedItems = userItems.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )

    const middleItem = sortedItems[10]

    const sut = await getUserItemsService({
      status: middleItem.status,
      userId: user.id,
      pageSize: 20,
      orderBy: 'updatedAt',
      orderDirection: 'desc',
      cursor: new Date(middleItem.updatedAt).toISOString(),
      rating: [0, 5],
      mediaType: ['TV_SHOW', 'MOVIE'],
    })

    expect(sut.userItems.length).toBeGreaterThan(0)
    expect(sut.userItems.length).toBeLessThanOrEqual(20)
    expect(sut.nextCursor).toBeDefined()

    const timestamps = sut.userItems.map(item =>
      new Date(item.updatedAt).getTime()
    )
    expect(timestamps).toEqual([...timestamps].sort((a, b) => b - a))
  })

  it('should be able to filter by rating', async () => {
    const user = await makeUser()
    const userItem = await makeUserItem({ userId: user.id, status: 'WATCHED' })

    const itemsBeforeReview = await getUserItemsService({
      status: userItem.status,
      userId: user.id,
      pageSize: 20,
      orderBy: 'updatedAt',
      orderDirection: 'desc',
      rating: [4, 5],
      mediaType: ['TV_SHOW', 'MOVIE'],
    })

    expect(itemsBeforeReview.userItems).toHaveLength(0)

    await makeReview({
      userId: user.id,
      review: 'This is a test review',
      tmdbId: userItem.tmdbId,
      mediaType: userItem.mediaType,
      rating: 5,
    })

    const sut = await getUserItemsService({
      status: userItem.status,
      userId: user.id,
      pageSize: 20,
      orderBy: 'updatedAt',
      orderDirection: 'desc',
      rating: [5, 5],
      mediaType: ['MOVIE', 'TV_SHOW'],
    })

    expect(sut.userItems).toHaveLength(1)
  })

  it('should be able to filter by status', async () => {
    const user = await makeUser()
    const userItem = await makeUserItem({ userId: user.id, status: 'WATCHED' })

    const wrongStatus = await getUserItemsService({
      status: 'WATCHLIST',
      userId: user.id,
      pageSize: 20,
      orderBy: 'updatedAt',
      orderDirection: 'desc',
      rating: [0, 5],
      mediaType: [userItem.mediaType],
    })

    expect(wrongStatus.userItems).toHaveLength(0)

    const sut = await getUserItemsService({
      status: userItem.status,
      userId: user.id,
      pageSize: 20,
      orderBy: 'updatedAt',
      orderDirection: 'desc',
      rating: [0, 5],
      mediaType: [userItem.mediaType],
    })

    expect(sut.userItems).toHaveLength(1)
  })

  it('should be able to filter by media type', async () => {
    const user = await makeUser()
    const userItem = await makeUserItem({
      userId: user.id,
      status: 'WATCHED',
      mediaType: 'MOVIE',
    })

    const wrongMediaType = await getUserItemsService({
      status: userItem.status,
      userId: user.id,
      pageSize: 20,
      orderBy: 'updatedAt',
      orderDirection: 'desc',
      rating: [0, 5],
      mediaType: ['TV_SHOW'],
    })

    expect(wrongMediaType.userItems).toHaveLength(0)

    const sut = await getUserItemsService({
      status: userItem.status,
      userId: user.id,
      pageSize: 20,
      orderBy: 'updatedAt',
      orderDirection: 'desc',
      rating: [0, 5],
      mediaType: ['MOVIE'],
    })

    expect(sut.userItems).toHaveLength(1)
  })

  for (const field of ['addedAt', 'updatedAt']) {
    it(`should be able to order ${field} descending`, async () => {
      const user = await makeUser()
      const oldItem = await makeUserItem({ userId: user.id, status: 'WATCHED' })

      const earlierItem = await makeUserItem({
        userId: user.id,
        status: 'WATCHED',
        mediaType: 'TV_SHOW',
      })

      const earlierDate = new Date(new Date(oldItem.addedAt).getTime() - 1000)

      await updateUserItem(earlierItem, {
        addedAt: earlierDate,
        updatedAt: earlierDate,
      })

      await updateUserItem(oldItem, {
        addedAt: new Date(new Date(oldItem.addedAt).getTime() - 100000),
        updatedAt: new Date(new Date(oldItem.updatedAt).getTime() - 100000),
      })

      const sut = await getUserItemsService({
        status: 'WATCHED',
        userId: user.id,
        pageSize: 20,
        orderBy: 'addedAt',
        orderDirection: 'desc',
        rating: [0, 5],
        mediaType: ['TV_SHOW', 'MOVIE'],
      })

      expect(sut.userItems).toEqual([
        expect.objectContaining({ id: earlierItem.id }),
        expect.objectContaining({ id: oldItem.id }),
      ])
    })
  }

  for (const field of ['addedAt', 'updatedAt']) {
    it(`should be able to order ${field} ascending`, async () => {
      const user = await makeUser()
      const oldItem = await makeUserItem({ userId: user.id, status: 'WATCHED' })

      const earlierItem = await makeUserItem({
        userId: user.id,
        status: 'WATCHED',
        mediaType: 'TV_SHOW',
      })

      const earlierDate = new Date(new Date(oldItem.addedAt).getTime() - 1000)

      await updateUserItem(earlierItem, {
        addedAt: earlierDate,
        updatedAt: earlierDate,
      })

      await updateUserItem(oldItem, {
        addedAt: new Date(new Date(oldItem.addedAt).getTime() - 100000),
        updatedAt: new Date(new Date(oldItem.updatedAt).getTime() - 100000),
      })

      const sut = await getUserItemsService({
        status: 'WATCHED',
        userId: user.id,
        pageSize: 20,
        orderBy: 'updatedAt',
        orderDirection: 'asc',
        rating: [0, 5],
        mediaType: ['TV_SHOW', 'MOVIE'],
      })

      expect(sut.userItems).toEqual([
        expect.objectContaining({ id: oldItem.id }),
        expect.objectContaining({ id: earlierItem.id }),
      ])
    })
  }

  it('should be able to order by rating descending', async () => {
    const user = await makeUser()
    const userItem = await makeUserItem({ userId: user.id, status: 'WATCHED' })

    await makeReview({
      userId: user.id,
      tmdbId: userItem.tmdbId,
      mediaType: userItem.mediaType,
      rating: 5,
    })

    const lowerItem = await makeUserItem({
      userId: user.id,
      status: 'WATCHED',
    })

    await makeReview({
      userId: user.id,
      tmdbId: lowerItem.tmdbId,
      mediaType: lowerItem.mediaType,
      rating: 4,
    })

    const sut = await getUserItemsService({
      status: 'WATCHED',
      userId: user.id,
      pageSize: 20,
      orderBy: 'rating',
      orderDirection: 'desc',
      rating: [0, 5],
      mediaType: ['TV_SHOW', 'MOVIE'],
    })

    expect(sut.userItems).toEqual([
      expect.objectContaining({ id: userItem.id }),
      expect.objectContaining({ id: lowerItem.id }),
    ])
  })

  it('should be able to order by rating ascending', async () => {
    const user = await makeUser()
    const userItem = await makeUserItem({ userId: user.id, status: 'WATCHED' })

    await makeReview({
      userId: user.id,
      tmdbId: userItem.tmdbId,
      mediaType: userItem.mediaType,
      rating: 5,
    })

    const lowerItem = await makeUserItem({
      userId: user.id,
      status: 'WATCHED',
    })

    await makeReview({
      userId: user.id,
      tmdbId: lowerItem.tmdbId,
      mediaType: lowerItem.mediaType,
      rating: 4,
    })

    const sut = await getUserItemsService({
      status: 'WATCHED',
      userId: user.id,
      pageSize: 20,
      orderBy: 'rating',
      orderDirection: 'asc',
      rating: [0, 5],
      mediaType: ['TV_SHOW', 'MOVIE'],
    })

    expect(sut.userItems).toEqual([
      expect.objectContaining({ id: lowerItem.id }),
      expect.objectContaining({ id: userItem.id }),
    ])
  })

  it('should be able to get user items without rating', async () => {
    const user = await makeUser()
    const userItem = await makeUserItem({ userId: user.id, status: 'WATCHED' })

    const sut = await getUserItemsService({
      status: userItem.status,
      userId: user.id,
      pageSize: 20,
      orderBy: 'updatedAt',
      orderDirection: 'desc',
      rating: [0, 5],
      mediaType: ['MOVIE', 'TV_SHOW'],
    })

    expect(sut.userItems).toHaveLength(1)
  })

  it('should be able to get user items with review and without review', async () => {
    const user = await makeUser()
    const userItem = await makeUserItem({ userId: user.id, status: 'WATCHED' })
    await makeUserItem({
      userId: user.id,
      status: 'WATCHED',
    })

    await makeReview({
      userId: user.id,
      tmdbId: userItem.tmdbId,
      mediaType: userItem.mediaType,
      rating: 5,
    })

    const sut = await getUserItemsService({
      status: userItem.status,
      userId: user.id,
      pageSize: 20,
      orderBy: 'updatedAt',
      orderDirection: 'desc',
      rating: [0, 5],
      mediaType: ['MOVIE', 'TV_SHOW'],
    })

    expect(sut.userItems).toHaveLength(2)
  })

  it('should not be able to get user items without review when rating is greater than 1', async () => {
    const user = await makeUser()
    const userItem = await makeUserItem({ userId: user.id, status: 'WATCHED' })
    await makeUserItem({
      userId: user.id,
      status: 'WATCHED',
    })

    await makeReview({
      userId: user.id,
      tmdbId: userItem.tmdbId,
      mediaType: userItem.mediaType,
      rating: 5,
    })

    const sut = await getUserItemsService({
      status: userItem.status,
      userId: user.id,
      pageSize: 20,
      orderBy: 'updatedAt',
      orderDirection: 'desc',
      rating: [2, 5],
      mediaType: ['MOVIE', 'TV_SHOW'],
    })

    expect(sut.userItems).toHaveLength(1)
  })

  it('should not be able to get user items without review when rating is less than 5', async () => {
    const user = await makeUser()
    const userItem = await makeUserItem({ userId: user.id, status: 'WATCHED' })
    await makeUserItem({
      userId: user.id,
      status: 'WATCHED',
    })

    await makeReview({
      userId: user.id,
      tmdbId: userItem.tmdbId,
      mediaType: userItem.mediaType,
      rating: 4,
    })

    const sut = await getUserItemsService({
      status: userItem.status,
      userId: user.id,
      pageSize: 20,
      orderBy: 'updatedAt',
      orderDirection: 'desc',
      rating: [0, 4],
      mediaType: ['MOVIE', 'TV_SHOW'],
    })

    expect(sut.userItems).toHaveLength(1)
  })

  it('should be able get only items without review when onlyItemsWithoutReview is true', async () => {
    const user = await makeUser()

    // item with review
    const userItem = await makeUserItem({ userId: user.id, status: 'WATCHED' })

    // items without review
    await makeUserItem({ userId: user.id, status: 'WATCHED' })
    await makeUserItem({ userId: user.id, status: 'WATCHED' })
    await makeUserItem({ userId: user.id, status: 'WATCHED' })

    await makeReview({
      userId: user.id,
      tmdbId: userItem.tmdbId,
      mediaType: userItem.mediaType,
      rating: 5,
    })

    const sut = await getUserItemsService({
      status: userItem.status,
      userId: user.id,
      pageSize: 20,
      orderBy: 'updatedAt',
      orderDirection: 'desc',
      onlyItemsWithoutReview: true,
      rating: [0, 5],
      mediaType: ['MOVIE', 'TV_SHOW'],
    })

    expect(sut.userItems).toHaveLength(3)
  })
})

type UpdateUserItemParams = {
  addedAt?: Date
  updatedAt?: Date
}

async function updateUserItem(
  userItem: UserItem,
  params: UpdateUserItemParams
) {
  await db
    .update(schema.userItems)
    .set(params)
    .where(eq(schema.userItems.id, userItem.id))
}
