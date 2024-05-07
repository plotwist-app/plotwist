'use client'

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from 'sonner'
import { zodResolver } from '@hookform/resolvers/zod'
import { MovieDetails, TvSerieDetails } from '@plotwist/tmdb'

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

import { useReplies } from '@/hooks/use-replies'

import { MediaType } from '@/types/supabase/media-type'

import { APP_QUERY_CLIENT } from '@/context/app/app'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { tmdbImage } from '@/utils/tmdb/image'

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
  tmdbItem: { id: tmdbId },
  mediaType,
}: ReviewReplyFormProps) => {
  const { handleCreateReply } = useReplies()

  const { user } = useAuth()
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
        onSuccess: () => {
          form.reset()
          toast.success(dictionary.review_reply_form.success)

          onOpenReplies(true)
          onOpenReplyForm(false)

          APP_QUERY_CLIENT.invalidateQueries({
            queryKey: [tmdbId, mediaType],
          })
        },
      },
    )
  }

  const username = user.username
  const usernameInitial = username[0].toUpperCase()
  const imagePath = user.image_path

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
