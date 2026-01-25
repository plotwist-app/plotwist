import { beforeAll, describe, expect, it } from 'vitest'
import type { User } from '@/domain/entities/user'

import { makeRawLike } from '@/test/factories/make-like'
import { makeList } from '@/test/factories/make-list'
import { makeReview } from '@/test/factories/make-review'
import { makeReviewReply } from '@/test/factories/make-review-reply'
import { makeUser } from '@/test/factories/make-user'
import { createLikeService } from './create-like'

let user: User

describe('create like', () => {
  beforeAll(async () => {
    user = await makeUser()
  })

  it('should be able to create review like', async () => {
    const review = await makeReview({ userId: user.id })
    const like = makeRawLike({
      userId: user.id,
      entityType: 'REVIEW',
      entityId: review.id,
    })

    const sut = await createLikeService(like)

    expect(sut).toEqual({
      like: expect.objectContaining(like),
    })
  })

  it('should be able to create reply like', async () => {
    const review = await makeReview({ userId: user.id })
    const reply = await makeReviewReply({
      userId: user.id,
      reviewId: review.id,
    })

    const like = makeRawLike({
      userId: user.id,
      entityType: 'REPLY',
      entityId: reply.id,
    })

    const sut = await createLikeService(like)

    expect(sut).toEqual({
      like: expect.objectContaining(like),
    })
  })

  it('should be able to create list like', async () => {
    const list = await makeList({ userId: user.id })
    const like = makeRawLike({
      userId: user.id,
      entityType: 'LIST',
      entityId: list.id,
    })

    const sut = await createLikeService(like)

    expect(sut).toEqual({
      like: expect.objectContaining(like),
    })
  })
})
