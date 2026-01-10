'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@plotwist/ui/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@plotwist/ui/components/ui/form'
import { Input } from '@plotwist/ui/components/ui/input'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import type {
  GetSocialLinks200SocialLinksItem,
  PutSocialLinksBody,
} from '@/api/endpoints.schemas'
import { usePutSocialLinks } from '@/api/social-links'
import { useLanguage } from '@/context/language'

const socialLinksSchema = z.object({
  TIKTOK: z.string().url('Enter a valid URL').or(z.literal('')).optional(),
  INSTAGRAM: z.string().url('Enter a valid URL').or(z.literal('')).optional(),
  YOUTUBE: z.string().url('Enter a valid URL').or(z.literal('')).optional(),
  X: z.string().url('Enter a valid URL').or(z.literal('')).optional(),
})

type SocialLinksFormValues = z.infer<typeof socialLinksSchema>

type SocialLinksFormProps = {
  socialLinks: GetSocialLinks200SocialLinksItem[]
  onClose: () => void
}

const SOCIAL_LINKS = ['INSTAGRAM', 'TIKTOK', 'X', 'YOUTUBE'] as const

export function SocialLinksForm({
  socialLinks,
  onClose,
}: SocialLinksFormProps) {
  const { mutateAsync } = usePutSocialLinks()
  const { refresh } = useRouter()
  const { dictionary } = useLanguage()

  const form = useForm<SocialLinksFormValues>({
    resolver: zodResolver(socialLinksSchema),
    defaultValues: SOCIAL_LINKS.reduce((acc, platform) => {
      acc[platform] =
        socialLinks.find(socialLink => socialLink.platform === platform)?.url ||
        undefined

      return acc
    }, {} as SocialLinksFormValues),
  })

  const onSubmit = async (values: SocialLinksFormValues) => {
    await mutateAsync(
      {
        data: SOCIAL_LINKS.reduce((acc, platform) => {
          acc[platform] = values[platform] || ''
          return acc
        }, {} as PutSocialLinksBody),
      },
      {
        onSuccess: () => {
          refresh()
          onClose()
        },
      }
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="INSTAGRAM"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Instagram</FormLabel>

              <FormControl>
                <Input placeholder="Instagram URL" {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="TIKTOK"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tiktok</FormLabel>

              <FormControl>
                <Input placeholder="Tiktok URL" {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="X"
          render={({ field }) => (
            <FormItem>
              <FormLabel>X</FormLabel>

              <FormControl>
                <Input placeholder="X URL" {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="YOUTUBE"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Youtube</FormLabel>

              <FormControl>
                <Input placeholder="Youtube URL" {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button
            type="submit"
            loading={form.formState.isSubmitting}
            disabled={!form.formState.isDirty}
          >
            {dictionary.save_social_links}
          </Button>
        </div>
      </form>
    </Form>
  )
}
