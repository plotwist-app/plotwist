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

import { useAuth } from '@/context/auth'
import { useLanguage } from '@/context/language'

import { Dictionary } from '@/utils/dictionaries'

import { useReplies } from '@/hooks/use-replies/use-replies'

import { MediaType } from '@/types/supabase/media-type'
import { TvSeriesDetails } from '@/services/tmdb/requests/tv-series/details'
import { MovieDetails } from '@/services/tmdb/requests/movies/details'
import { APP_QUERY_CLIENT } from '@/context/app/app'

type TmdbItem = TvSeriesDetails | MovieDetails

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
  tmdbItem: { id: tmdbId },
  mediaType,
}: ReviewReplyFormProps) => {
  const { handleCreateReply } = useReplies()

  const { user } = useAuth()
  const { dictionary } = useLanguage()

  const form = useForm<ReplyFormValues>({
    resolver: zodResolver(replyFormSchema(dictionary)),
    defaultValues: {
      reply: '',
    },
  })

  const onSubmit = async (values: ReplyFormValues) => {
    await handleCreateReply.mutateAsync(
      {
        userId: user.id,
        reply: values.reply,
        reviewId,
      },
      {
        onSuccess: () => {
          form.reset()
          toast.success(dictionary.review_form.success)

          onOpenReplyForm(false)
          onOpenReplies(true)

          APP_QUERY_CLIENT.invalidateQueries({
            queryKey: [tmdbId, mediaType],
          })
        },
      },
    )
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col items-start gap-2 pt-3"
      >
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

        <Button
          className="self-end"
          variant="outline"
          type="submit"
          loading={form.formState.isSubmitting}
        >
          {dictionary.review_reply.reply}
        </Button>
      </form>
    </Form>
  )
}
