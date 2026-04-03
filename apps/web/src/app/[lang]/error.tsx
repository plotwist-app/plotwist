'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AlertCircle } from 'lucide-react'
import { Button } from '@plotwist/ui/components/ui/button'
import { useLanguage } from '@/context/language'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { dictionary } = useLanguage()
  const { lang } = useParams()
  const router = useRouter()

  useEffect(() => {
    console.error(error)
  }, [error])

  const { error_page } = dictionary

  return (
    <div className="flex min-h-[70svh] w-full flex-col items-center justify-center gap-6 px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="rounded-full border border-destructive/20 bg-destructive/10 p-4">
          <AlertCircle className="size-10 text-destructive" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            {error_page.title}
          </h1>

          <p className="max-w-md text-muted-foreground">
            {error_page.description}
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => router.push(`/${lang}`)}>
          {error_page.go_home}
        </Button>

        <Button onClick={() => reset()}>{error_page.try_again}</Button>
      </div>
    </div>
  )
}
