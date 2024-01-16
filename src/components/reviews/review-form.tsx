'use client'

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from 'sonner'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { APP_QUERY_CLIENT } from '@/context/app/app'
import { useAuth } from '@/context/auth'

import { useReviews } from '@/hooks/use-reviews/use-reviews'

import { ReviewStars } from './review-stars'
import { ReviewsProps } from './reviews'

type ReviewFormProps = ReviewsProps

const reviewFormSchema = z.object({
  review: z.string().min(1, 'Review is required.'),
  rating: z.number().min(0, 'Required').max(5, 'Max value of rating is 5'),
})

export const ReviewForm = ({ tmdbItem, mediaType }: ReviewFormProps) => {
  const { handleCreateReview } = useReviews()
  const { user } = useAuth()

  const form = useForm<z.infer<typeof reviewFormSchema>>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      review: '',
      rating: 0,
    },
  })

  const onSubmit = async (values: z.infer<typeof reviewFormSchema>) => {
    await handleCreateReview.mutateAsync(
      {
        ...values,
        mediaType,
        userId: user.id,
        tmdbItem,
      },

      {
        onSuccess: () => {
          APP_QUERY_CLIENT.invalidateQueries({
            queryKey: [tmdbItem.id, mediaType],
          })

          form.reset()

          toast.success('Review created successfully.')
        },
      },
    )
  }

  const username = user.user_metadata.username
  const usernameInitial = username[0].toUpperCase()

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex items-start space-x-4"
      >
        <div className="flex aspect-square h-10 w-10 items-center justify-center rounded-full border bg-muted">
          {usernameInitial}
        </div>

        <div className="w-full space-y-2">
          <div className="flex justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">{username}</span>

              <span className="h-1 w-1 rounded-full bg-muted" />

              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <ReviewStars onChange={field.onChange} rating={field.value} />
                )}
              />
            </div>

            <div className="flex justify-end">
              <Button
                variant="outline"
                type="submit"
                loading={form.formState.isSubmitting}
              >
                Publish
              </Button>
            </div>
          </div>

          <FormField
            control={form.control}
            name="review"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea placeholder="What you think about?" {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  )
}
