'use client'

import '@plotwist/ui/globals.css'

import { useEffect } from 'react'
import { AlertCircle } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="en">
      <body className="bg-background antialiased">
        <div className="flex min-h-svh w-full flex-col items-center justify-center gap-6 px-4">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="rounded-full border border-destructive/20 bg-destructive/10 p-4">
              <AlertCircle className="size-10 text-destructive" />
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">
                Something went wrong
              </h1>

              <p className="max-w-md text-muted-foreground">
                An unexpected error occurred. Don&apos;t worry, it&apos;s not
                your fault.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <a
              href="/"
              className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Go to home
            </a>

            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
