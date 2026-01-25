import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@plotwist/ui/components/ui/button'
import { Form } from '@plotwist/ui/components/ui/form'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { useUpdateUserPreferences } from '@/api/users'
import { WatchProviders } from '@/components/watch-providers'
import { WatchRegion } from '@/components/watch-region'
import { useLanguage } from '@/context/language'
import { useUserPreferences } from '@/context/user-preferences'

const schema = z.object({
  with_watch_providers: z.array(z.number()),
  watch_region: z.string(),
})

type UserPreferencesFormValues = z.infer<typeof schema>

export function UserPreferences() {
  const { dictionary, language } = useLanguage()
  const { mutateAsync: updateUserPreferences } = useUpdateUserPreferences()
  const { userPreferences } = useUserPreferences()
  const { refresh } = useRouter()

  const form = useForm<UserPreferencesFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      with_watch_providers: userPreferences?.watchProvidersIds ?? [],
      watch_region: userPreferences?.watchRegion ?? language.split('-')[1],
    },
  })

  async function handleSubmit({
    with_watch_providers: watchProvidersIds,
    watch_region: watchRegion,
  }: UserPreferencesFormValues) {
    await updateUserPreferences(
      {
        data: {
          watchProvidersIds: watchProvidersIds,
          watchRegion,
        },
      },
      {
        onSuccess: () => {
          refresh()
          toast.success(dictionary.preferences_updated)
        },
        onError: () => {
          toast.error('Erro ao atualizar preferências')
        },
      }
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="space-y-2">
          <WatchRegion />
          <WatchProviders />

          <p className="text-sm text-muted-foreground">
            {dictionary.preferences_description}
          </p>
        </div>

        <div className="flex justify-end">
          <Button loading={form.formState.isSubmitting}>
            {dictionary.save_preferences}
          </Button>
        </div>
      </form>
    </Form>
  )
}
