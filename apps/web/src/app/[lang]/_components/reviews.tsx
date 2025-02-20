import { getDetailedReviews } from '@/api/reviews'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@plotwist/ui/components/ui/avatar'
import Image from 'next/image'

export async function Reviews() {
  const { reviews } = await getDetailedReviews({
    language: 'pt-BR',
    userId: undefined,
    limit: '5',
    orderBy: 'likeCount',
    interval: 'ALL_TIME',
  })

  return (
    <div className="absolute left-0 bottom-0 aspect-poster w-1/4 z-40 flex flex-col justify-end gap-2">
      {reviews.map(review => (
        <div
          key={review.id}
          className="w-full h-[40px] bg-background border rounded-lg flex items-center justify-center text-sm text-muted-foreground overflow-hidden pl-2 gap-2"
        >
          <Avatar className="size-6 border">
            {review.user.avatarUrl ? (
              <Image
                src={review.user.avatarUrl}
                className="object-cover"
                alt={review.user.username}
                fill
              />
            ) : (
              <AvatarFallback>{review.user.username[0]}</AvatarFallback>
            )}
          </Avatar>

          <p className="line-clamp-1">{review.review}</p>
        </div>
      ))}
    </div>
  )
}
