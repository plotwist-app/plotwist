import { faker } from '@faker-js/faker'
import type {
  InsertReviewReplyModel,
  ReviewReply,
} from '@/domain/entities/review-reply'
import { insertReviewReply } from '@/infra/db/repositories/review-replies-repository'

type Overrides = Partial<ReviewReply> & Pick<ReviewReply, 'userId' | 'reviewId'>

export function makeRawReviewReply(
  overrides: Overrides
): InsertReviewReplyModel {
  return {
    reply: faker.lorem.paragraph(1),
    ...overrides,
  }
}

export async function makeReviewReply(overrides: Overrides) {
  const reviewReply = await insertReviewReply(makeRawReviewReply(overrides))

  if (!reviewReply || reviewReply.length === 0) {
    throw new Error('Review not found')
  }

  return reviewReply[0]
}
