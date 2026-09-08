'use client'

import { useQuery } from '@tanstack/react-query'
import { Check } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useRef } from 'react'
import { useLanguage } from '@/context/language'
import { cn } from '@/lib/utils'
import { tmdb } from '@/services/tmdb'
import { tmdbImage } from '@/utils/tmdb/image'
import { PrimaryButton } from './primary-button'

type TogetherProviderStepProps = {
  region: string
  providerIds: number[]
  onRegionChange: (region: string) => void
  onProviderIdsChange: (providerIds: number[]) => void
  onContinue: () => void
}

export function TogetherProviderStep({
  region,
  providerIds,
  onRegionChange,
  onProviderIdsChange,
  onContinue,
}: TogetherProviderStepProps) {
  const { dictionary, language } = useLanguage()
  const copy = dictionary.together
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  const regionsQuery = useQuery({
    queryKey: ['together-watch-provider-regions', language],
    queryFn: () => tmdb.watchProviders.regions({ language }),
  })

  const providersQuery = useQuery({
    queryKey: ['together-watch-providers', 'movie', language, region],
    queryFn: () =>
      tmdb.watchProviders.list('movie', {
        language,
        watch_region: region,
      }),
    enabled: Boolean(region),
  })

  const isLoading = regionsQuery.isLoading || providersQuery.isLoading
  const isError = regionsQuery.isError || providersQuery.isError

  function toggleProvider(providerId: number) {
    onProviderIdsChange(
      providerIds.includes(providerId)
        ? providerIds.filter(id => id !== providerId)
        : [...providerIds, providerId]
    )
  }

  function changeRegion(nextRegion: string) {
    if (nextRegion === region) return
    onProviderIdsChange([])
    onRegionChange(nextRegion)
  }

  function retry() {
    void regionsQuery.refetch()
    void providersQuery.refetch()
  }

  return (
    <section aria-labelledby="together-provider-heading">
      <h2
        ref={headingRef}
        id="together-provider-heading"
        className="together-title outline-none"
        tabIndex={-1}
      >
        {copy.provider_heading}
      </h2>
      <p className="together-body together-fg-muted mt-2">
        {copy.provider_explanation}
      </p>

      {isLoading ? (
        <p
          className="together-body together-fg-muted py-12 text-center"
          aria-live="polite"
        >
          {copy.provider_loading}
        </p>
      ) : (
        <>
          {isError ? (
            <div
              className="together-dashed mt-6 rounded-[1.25rem] p-6 text-center"
              role="alert"
            >
              <p className="together-body together-fg-muted">
                {copy.provider_error}
              </p>
              <button
                type="button"
                onClick={retry}
                className="together-label together-fg-accent mt-4 underline-offset-4 hover:underline"
              >
                {copy.provider_retry}
              </button>
            </div>
          ) : (
            <label className="mt-6 flex flex-col gap-2">
              <span className="together-label together-fg-muted">
                {copy.provider_region}
              </span>
              <select
                value={region}
                onChange={event => changeRegion(event.target.value)}
                className="together-surface together-body h-[3.15rem] w-full rounded-[0.9rem] border border-[var(--tg-border)] px-3 text-[var(--tg-text)] outline-none focus-visible:border-[var(--tg-accent)] focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--tg-accent)_28%,transparent)]"
              >
                {regionsQuery.data?.map(item => (
                  <option key={item.iso_3166_1} value={item.iso_3166_1}>
                    {item.native_name || item.english_name}
                  </option>
                ))}
              </select>
            </label>
          )}

          <div className="mt-5 grid grid-cols-2 gap-2.5">
            <button
              type="button"
              aria-pressed={providerIds.length === 0}
              aria-label={
                providerIds.length === 0
                  ? `${copy.provider_any}, ${copy.provider_selected}`
                  : copy.provider_any
              }
              onClick={() => onProviderIdsChange([])}
              className={cn(
                'together-label relative flex min-h-14 items-center justify-center gap-2 rounded-[1rem] border px-3 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tg-accent)]',
                providerIds.length === 0
                  ? 'border-[var(--tg-accent)] bg-[var(--tg-wash)] text-[var(--tg-accent)]'
                  : 'together-surface border-[var(--tg-border)] text-[var(--tg-text)]'
              )}
            >
              {copy.provider_any}
              {providerIds.length === 0 && (
                <>
                  <Check className="size-4 shrink-0" aria-hidden="true" />
                  <span className="sr-only">{copy.provider_selected}</span>
                </>
              )}
            </button>

            {!isError &&
              providersQuery.data?.map(provider => {
                const selected = providerIds.includes(provider.provider_id)

                return (
                  <button
                    key={provider.provider_id}
                    type="button"
                    aria-pressed={selected}
                    aria-label={
                      selected
                        ? `${provider.provider_name}, ${copy.provider_selected}`
                        : provider.provider_name
                    }
                    onClick={() => toggleProvider(provider.provider_id)}
                    className={cn(
                      'together-label flex min-h-14 items-center gap-2.5 rounded-[1rem] border px-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tg-accent)]',
                      selected
                        ? 'border-[var(--tg-accent)] bg-[var(--tg-wash)] text-[var(--tg-accent)]'
                        : 'together-surface border-[var(--tg-border)] text-[var(--tg-text)]'
                    )}
                  >
                    <Image
                      src={tmdbImage(provider.logo_path, 'w500')}
                      alt=""
                      width={32}
                      height={32}
                      className="size-8 shrink-0 rounded-lg"
                    />
                    <span>{provider.provider_name}</span>
                    {selected && (
                      <>
                        <Check
                          className="ml-auto size-4 shrink-0"
                          aria-hidden="true"
                        />
                        <span className="sr-only">
                          {copy.provider_selected}
                        </span>
                      </>
                    )}
                  </button>
                )
              })}
          </div>

          <PrimaryButton className="mt-6" onClick={onContinue}>
            {copy.provider_continue}
          </PrimaryButton>
        </>
      )}
    </section>
  )
}
