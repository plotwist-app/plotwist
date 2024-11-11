'use client'

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from 'sonner'
import { zodResolver } from '@hookform/resolvers/zod'
import { MovieDetails, TvSerieDetails } from '@/services/tmdb'

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

import { Dictionary } from '@/utils/dictionaries'

import { useReplies } from '@/hooks/use-replies'

import { MediaType } from '@/types/supabase/media-type'

import Link from 'next/link'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@plotwist/ui/components/ui/avatar'
import { tmdbImage } from '@/utils/tmdb/image'
import { useReviews } from '@/hooks/use-reviews'
import { useSession } from '@/context/session'

type TmdbItem = TvSerieDetails | MovieDetails

export const replyFormSchema = (dictionary: Dictionary) =>
  z.object({
    reply: z.string().min(1, dictionary.review_form.required),
  })

export type ReplyFormValues = z.infer<ReturnType<typeof replyFormSchema>>

interface ReviewReplyFormProps {
  reviewId: string
  onOpenReplyForm: (param: boolean) => void
  onOpenReplies: (param: boolean) => void
  tmdbItem: TmdbItem
  mediaType: MediaType
}

export const ReviewReplyForm = ({
  reviewId,
  onOpenReplyForm,
  onOpenReplies,
}: ReviewReplyFormProps) => {
  const { handleCreateReply } = useReplies()
  const { invalidateQueries } = useReviews()

  const { user } = useSession()
  const { dictionary, language } = useLanguage()

  const form = useForm<ReplyFormValues>({
    resolver: zodResolver(replyFormSchema(dictionary)),
    defaultValues: {
      reply: '',
    },
  })

  if (!user) return <></>

  const onSubmit = async (values: ReplyFormValues) => {
    await handleCreateReply.mutateAsync(
      {
        userId: user.id,
        reply: values.reply,
        reviewId,
      },
      {
        onSettled: async () => {
          await invalidateQueries(reviewId)
          toast.success(dictionary.review_reply_form.success)

          form.reset()

          onOpenReplies(true)
          onOpenReplyForm(false)
        },
      },
    )
  }

  const username = user.username
  const usernameInitial = username?.at(0)?.toUpperCase()
  const imagePath = user.imagePath

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col items-start gap-2 pt-3"
      >
        <div className="flex w-full gap-2">
          <Link href={`/${language}/${username}`}>
            <Avatar className="size-10 border text-[10px] shadow">
              {imagePath && (
                <AvatarImage
                  src={tmdbImage(imagePath, 'w500')}
                  className="object-cover"
                />
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
