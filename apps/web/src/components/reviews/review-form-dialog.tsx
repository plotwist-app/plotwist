'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@plotwist/ui/components/ui/button'
import { Checkbox } from '@plotwist/ui/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@plotwist/ui/components/ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@plotwist/ui/components/ui/drawer'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@plotwist/ui/components/ui/form'
import { Label } from '@plotwist/ui/components/ui/label'
import { Rating } from '@plotwist/ui/components/ui/rating'
import { Textarea } from '@plotwist/ui/components/ui/textarea'
import { useQueryClient } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { type PropsWithChildren, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import type { GetReview200Review } from '@/api/endpoints.schemas'
import {
  getGetReviewQueryKey,
  getGetReviewsQueryKey,
  usePostReview,
  usePutReviewById,
} from '@/api/reviews'
import { getGetUserEpisodesQueryKey } from '@/api/user-episodes'
import {
  getGetUserItemQueryKey,
  useGetUserItem,
  usePutUserItem,
} from '@/api/user-items'
import { useLanguage } from '@/context/language'
import { useMediaQuery } from '@/hooks/use-media-query'
import type { Dictionary } from '@/utils/dictionaries'

export const reviewFormDialogSchema = (dictionary: Dictionary) =>
  z.object({
    rating: z
      .number()
      .min(0, 'Required')
      .max(5, dictionary.review_form.rating_max),
    review: z.string().min(1, dictionary.review_form.required),
    hasSpoilers: z.boolean(),
  })

export type ReviewFormDialogValues = z.infer<
  ReturnType<typeof reviewFormDialogSchema>
>

type ReviewFormDialogProps = PropsWithChildren & {
  mediaType: 'MOVIE' | 'TV_SHOW'
  tmdbId: number
  review?: GetReview200Review
}

export function ReviewFormDialog({
  children,
  mediaType,
  tmdbId,
  review,
}: ReviewFormDialogProps) {
  const params = useParams<{
    seasonNumber?: string
    episodeNumber?: string
  }>()

  const seasonNumber = params.seasonNumber
    ? Number(params.seasonNumber)
    : undefined

  const episodeNumber = params.episodeNumber
    ? Number(params.episodeNumber)
    : undefined

  const isDesktop = useMediaQuery('(min-width: 768px)')
  const { dictionary, language } = useLanguage()
  const [open, setOpen] = useState(false)

  const postReview = usePostReview()
  const putReview = usePutReviewById()
  const putUserItem = usePutUserItem()

  const { data: userItem } = useGetUserItem(
    {
      mediaType,
      tmdbId: String(tmdbId),
    },
    { query: { select: data => data.userItem } }
  )

  const form = useForm({
    resolver: zodResolver(reviewFormDialogSchema(dictionary)),

    defaultValues: {
      review: review?.review || '',
      rating: review?.rating || 0,
      hasSpoilers: false,
    },
  })

  const queryClient = useQueryClient()

  const onSubmit = async (values: ReviewFormDialogValues) => {
    const data = {
      ...values,
      mediaType,
      tmdbId,
      language,
      seasonNumber,
      episodeNumber,
    }

    const query = {
      onSuccess: async () => {
        const isEpisode = seasonNumber && episodeNumber
        const isSeason = seasonNumber && !episodeNumber
        const isWatched = userItem?.status === 'WATCHED'

        if (!isWatched && !isEpisode && !isSeason) {
          await putUserItem.mutateAsync(
            {
              data: {
                mediaType,
                tmdbId: tmdbId,
                status: 'WATCHED',
              },
            },
            {
              onSettled: async response => {
                await queryClient.setQueryData(
                  getGetUserItemQueryKey({
                    mediaType,
                    tmdbId: String(tmdbId),
                  }),
                  response
                )

                if (mediaType === 'TV_SHOW') {
                  await queryClient.invalidateQueries({
                    queryKey: getGetUserEpisodesQueryKey({
                      tmdbId: String(tmdbId),
                    }),
                  })
                }
              },
            }
          )
        }

        await Promise.all(
          [
            getGetReviewQueryKey({ mediaType, tmdbId: String(tmdbId) }),
            getGetReviewsQueryKey({
              tmdbId: String(tmdbId),
              mediaType,
              orderBy: 'createdAt',
            }),
          ].map(
            async queryKey =>
              await queryClient.invalidateQueries({
                queryKey: queryKey,
              })
          )
        )

        setOpen(false)
      },
    }

    if (review) {
      return await putReview.mutateAsync(
        {
          data,
          id: review.id,
        },
        query
      )
    }

    await postReview.mutateAsync(
      {
        data,
      },
      query
    )

    form.reset({
      review: '',
      rating: 0,
      hasSpoilers: false,
    })
  }

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>

        <DialogContent className="flex flex-col">
          <DialogHeader>
            <DialogTitle>{dictionary.what_did_you_think}</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <Rating
                    size={24}
                    onChange={field.onChange}
                    defaultRating={field.value}
                  />
                )}
              />

              <FormField
                control={form.control}
                name="review"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormControl>
                      <Textarea
                        placeholder={dictionary.share_your_opinion_here}
                        rows={5}
                        {...field}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-between">
                <FormField
                  control={form.control}
                  name="hasSpoilers"
                  render={({ field }) => (
                    <div className="flex items-center gap-2">
                      <Checkbox
                        onCheckedChange={field.onChange}
                        checked={field.value}
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

                <Button className="text" type="submit">
                  {review ? dictionary.edit_review : dictionary.submit_review}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>

      <DrawerContent className="flex flex-col items-center p-4">
        <DrawerHeader>
          <DrawerTitle>{dictionary.what_did_you_think}</DrawerTitle>
        </DrawerHeader>

        <Form {...form}>
          <form
            className="w-full flex flex-col items-center gap-4"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <Rating
                  size={32}
                  onChange={field.onChange}
                  defaultRating={field.value}
                />
              )}
            />

            <FormField
              control={form.control}
              name="review"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <Textarea
                      placeholder={dictionary.share_your_opinion_here}
                      rows={5}
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
                    checked={field.value}
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

            <div className="flex flex-col w-full justify-between items-center gap-4">
              <Button className="w-full">
                {review ? dictionary.edit_review : dictionary.submit_review}
              </Button>
            </div>
          </form>
        </Form>
      </DrawerContent>
    </Drawer>
  )
}
