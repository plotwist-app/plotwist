'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
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

import { useLanguage } from '@/context/language'

import type { Dictionary } from '@/utils/dictionaries'

import {
  getGetReviewRepliesQueryKey,
  usePostReviewReply,
} from '@/api/review-replies'
import { getGetReviewsQueryKey } from '@/api/reviews'
import { APP_QUERY_CLIENT } from '@/context/app'
import { useSession } from '@/context/session'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@plotwist/ui/components/ui/avatar'
import Link from 'next/link'
import type { ReviewItemProps } from '../review-item'

export const replyFormSchema = (dictionary: Dictionary) =>
  z.object({
    reply: z.string().min(1, dictionary.review_form.required),
  })

export type ReplyFormValues = z.infer<ReturnType<typeof replyFormSchema>>

type ReviewReplyFormProps = {
  onOpenReplyForm: (param: boolean) => void
  onOpenReplies: (param: boolean) => void
} & Pick<ReviewItemProps, 'review'>

export const ReviewReplyForm = ({
  review,
  onOpenReplyForm,
  onOpenReplies,
}: ReviewReplyFormProps) => {
  const { user } = useSession()
  const { dictionary, language } = useLanguage()
  const createReply = usePostReviewReply()

  const form = useForm<ReplyFormValues>({
    resolver: zodResolver(replyFormSchema(dictionary)),
    defaultValues: {
      reply: '',
    },
  })

  if (!user) return <></>

  const onSubmit = async ({ reply }: ReplyFormValues) => {
    await createReply.mutateAsync(
      { data: { reply, reviewId: review.id } },
      {
        onSuccess: async () => {
          form.reset()

          await Promise.all(
            [
              getGetReviewsQueryKey(),
              getGetReviewRepliesQueryKey({ reviewId: review.id }),
            ].map(queryKey =>
              APP_QUERY_CLIENT.invalidateQueries({
                queryKey,
              })
            )
          )

          onOpenReplies(true)
          onOpenReplyForm(false)
        },
      }
    )
  }

  const username = user.username
  const usernameInitial = username?.at(0)?.toUpperCase()
  const { avatarUrl } = user

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col items-start gap-2 pt-3"
      >
        <div className="flex w-full gap-4">
          <Link href={`/${language}/${username}`}>
            <Avatar className="size-10 border text-[10px] shadow">
              {avatarUrl && (
                <AvatarImage src={avatarUrl} className="object-cover" />
              )}

              <AvatarFallback>{usernameInitial}</AvatarFallback>
            </Avatar>
          </Link>

          <FormField
            control={form.control}
            name="reply"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <Textarea
                    placeholder={dictionary.review_reply.placeholder}
                    {...field}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button
          className="self-end"
          variant="outline"
          type="submit"
          loading={form.formState.isSubmitting}
          size="sm"
        >
          {dictionary.review_reply.reply}
        </Button>
      </form>
    </Form>
  )
}
