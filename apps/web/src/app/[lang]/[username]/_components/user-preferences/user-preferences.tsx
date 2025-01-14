import { useLanguage } from '@/context/language'
import { Button } from '@plotwist/ui/components/ui/button'
import { Form } from '@plotwist/ui/components/ui/form'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { WatchRegion } from '@/components/watch-region'
import { WatchProviders } from '@/components/watch-providers'

const schema = z.object({
  with_watch_providers: z.array(z.string()),
  watch_region: z.string(),
})

type UserPreferencesFormValues = z.infer<typeof schema>

export function UserPreferences() {
  const { dictionary, language } = useLanguage()

  const form = useForm<UserPreferencesFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      with_watch_providers: [],
      watch_region: language.split('-')[1],
    },
  })

  return (
    <Form {...form}>
      <div className="space-y-4">
        <div className="space-y-2">
          <WatchRegion />
          <WatchProviders />

          <p className="text-sm text-muted-foreground">
            Suas preferências são usadas para personalizar sua experiência no
            Plotwist, como recomendações e filtros.
          </p>
        </div>

        <div className="flex justify-end">
          <Button>{dictionary.save_preferences}</Button>
        </div>
      </div>
    </Form>
  )
}
