'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@plotwist/ui/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@plotwist/ui/components/ui/form'
import { Textarea } from '@plotwist/ui/components/ui/textarea'

import { APP_QUERY_CLIENT } from '@/context/app/app'
import { useLanguage } from '@/context/language'

import type { Dictionary } from '@/utils/dictionaries'

import { getGetReviewsQueryKey, usePostReview } from '@/api/reviews'
import { useSession } from '@/context/session'
import { tmdbImage } from '@/utils/tmdb/image'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@plotwist/ui/components/ui/avatar'
import { Checkbox } from '@plotwist/ui/components/ui/checkbox'
import { Label } from '@plotwist/ui/components/ui/label'
import Link from 'next/link'
import type { ReviewsProps } from '..'
import { ReviewStars } from '../review-stars'
import { getGetUserItemQueryKey, usePutUserItem } from '@/api/user-items'

export const reviewFormSchema = (dictionary: Dictionary) =>
  z.object({
    review: z.string().min(1, dictionary.review_form.required),

    rating: z
      .number()
      .min(0, 'Required')
      .max(5, dictionary.review_form.rating_max),

    hasSpoilers: z.boolean(),
  })

export type ReviewFormValues = z.infer<ReturnType<typeof reviewFormSchema>>

export const ReviewForm = ({ tmdbItem, mediaType }: ReviewsProps) => {
  const postReview = usePostReview()
  const putUserItem = usePutUserItem()
  const { user } = useSession()
  const { dictionary, language } = useLanguage()

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema(dictionary)),
    defaultValues: {
      review: '',
      rating: 0,
      hasSpoilers: false,
    },
  })

  if (!user) {
    return (
      <div className="flex items-start space-x-4">
        <div className="aspect-square h-10 w-10 rounded-full border bg-muted" />

        <div className="relative flex-1 space-y-1 rounded-md border border-dashed p-4 shadow">
          <p className="text-sm">
            <Link href="/sign-in" className="text-muted-foreground underline">
              {dictionary.user_last_review.login}
            </Link>{' '}
            {dictionary.user_last_review.or}{' '}
            <Link href="/sign-up" className="text-muted-foreground underline">
              {dictionary.user_last_review.register}
            </Link>{' '}
            {dictionary.user_last_review.make_first_review}
          </p>
        </div>
      </div>
    )
  }

  const onSubmit = async (values: ReviewFormValues) => {
    await postReview.mutateAsync(
      {
        data: {
          ...values,
          mediaType,
          tmdbId: tmdbItem.id,
          language,
        },
      },

      {
        onSettled: async () => {
          await putUserItem.mutateAsync(
            {
              data: {
                mediaType,
                tmdbId: tmdbItem.id,
                status: 'WATCHED',
              },
            },
            {
              onSettled: response => {
                APP_QUERY_CLIENT.setQueryData(
                  getGetUserItemQueryKey({
                    mediaType,
                    tmdbId: String(tmdbItem.id),
                  }),
                  response
                )
              },
            }
          )

          await APP_QUERY_CLIENT.invalidateQueries({
            queryKey: getGetReviewsQueryKey({
              language,
              tmdbId: String(tmdbItem.id),
              mediaType,
            }),
          })

          form.reset()
          toast.success(dictionary.review_form.success)
        },
      }
    )
  }

  const username = user?.username
  const usernameInitial = username?.at(0)?.toUpperCase()

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex items-start space-x-4"
      >
        <Link href={`/${language}/${username}`}>
          <Avatar className="size-10 border text-[10px] shadow">
            {user.imagePath && (
              <AvatarImage
                src={tmdbImage(user.imagePath, 'w500')}
                className="object-cover"
                alt={username}
              />
            )}

            <AvatarFallback>{usernameInitial}</AvatarFallback>
          </Avatar>
        </Link>

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

            <div className="flex items-center space-x-2 justify-end">
              <Button
                variant="outline"
                type="submit"
                loading={form.formState.isSubmitting}
                size="sm"
              >
                {dictionary.review_form.publish}
              </Button>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 flex-1">
            <FormField
              control={form.control}
              name="review"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <Textarea
                      placeholder={dictionary.review_form.placeholder}
                      rows={4}
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="hasSpoilers"
              render={({ field }) => (
                <div className="flex items-center gap-2">
                  <Checkbox
                    onCheckedChange={field.onChange}
                    id="has_spoilers"
                    className="border-muted-foreground text-primary-foreground/80"
                  />
                  <Label
                    onClick={field.onChange}
                    htmlFor="has_spoilers"
                    className="text-muted-foreground hover:cursor-pointer text-sm"
                  >
                    {dictionary.contain_spoilers}
                  </Label>
                </div>
              )}
            />
          </div>
        </div>
      </form>
    </Form>
  )
}
