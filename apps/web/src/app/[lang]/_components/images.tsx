'use client'

import { Skeleton } from '@plotwist/ui/components/ui/skeleton'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import { useCallback, useEffect, useRef, useState } from 'react'

const TABS = [
  { key: 'activity', label: 'Activity' },
  { key: 'collection', label: 'Collection' },
  { key: 'reviews', label: 'Reviews' },
  { key: 'stats', label: 'Stats' },
  { key: 'preferences', label: 'Preferences' },
] as const

const ROTATION_INTERVAL = 5000

const getImageSrc = (theme: string, key: string) =>
  `/images/landing-page/${theme}/${key}.jpg`

export function Images() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const currentTheme = resolvedTheme || 'light'

  const startTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (progressRef.current) clearInterval(progressRef.current)

    setProgress(0)

    const progressStep = 50
    progressRef.current = setInterval(() => {
      setProgress(prev => Math.min(prev + progressStep / ROTATION_INTERVAL * 100, 100))
    }, progressStep)

    intervalRef.current = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % TABS.length)
      setProgress(0)
    }, ROTATION_INTERVAL)
  }, [])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    startTimer()
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (progressRef.current) clearInterval(progressRef.current)
    }
  }, [startTimer])

  const handleTabClick = (index: number) => {
    setActiveIndex(index)
    startTimer()
  }

  if (!mounted) {
    return (
      <section className="relative mx-auto max-w-6xl px-4 lg:px-0 hidden md:block pb-8">
        <div className="aspect-[1629/831] rounded-2xl overflow-hidden">
          <Skeleton className="w-full h-full" />
        </div>
      </section>
    )
  }

  return (
    <section className="relative mx-auto max-w-6xl px-4 lg:px-0 hidden md:block pb-8">
      <div className="flex items-center justify-center gap-1 mb-6">
        {TABS.map((tab, index) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => handleTabClick(index)}
            className={`
              relative px-4 py-2 text-sm rounded-full transition-all duration-300
              ${
                activeIndex === index
                  ? 'text-foreground font-medium'
                  : 'text-muted-foreground hover:text-foreground'
              }
            `}
          >
            {activeIndex === index && (
              <span className="absolute inset-0 rounded-full bg-foreground/[0.06] dark:bg-foreground/[0.08]" />
            )}
            <span className="relative">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="relative">
        <div className="aspect-[1629/831] relative overflow-hidden rounded-2xl bg-muted/30 shadow-2xl shadow-black/[0.08] dark:shadow-black/30 ring-1 ring-foreground/[0.06]">
          {TABS.map((tab, index) => (
            <Image
              key={tab.key}
              src={getImageSrc(currentTheme, tab.key)}
              alt={tab.label}
              fill
              className={`
                object-cover absolute top-0 left-0 transition-all duration-700 ease-in-out
                ${activeIndex === index ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.02]'}
              `}
              priority={index === 0}
            />
          ))}
        </div>

        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-2/3 h-8 bg-foreground/[0.03] blur-[40px]" />
      </div>

      <div className="flex items-center justify-center gap-1.5 mt-6">
        {TABS.map((_, index) => (
          <button
            key={TABS[index].key}
            type="button"
            onClick={() => handleTabClick(index)}
            className="relative h-1 rounded-full overflow-hidden transition-all duration-300"
            style={{ width: activeIndex === index ? 32 : 12 }}
          >
            <span className="absolute inset-0 bg-foreground/10 dark:bg-foreground/15" />
            {activeIndex === index && (
              <span
                className="absolute inset-y-0 left-0 bg-foreground/60 rounded-full transition-[width] ease-linear"
                style={{
                  width: `${progress}%`,
                  transitionDuration: '50ms',
                }}
              />
            )}
          </button>
        ))}
      </div>
    </section>
  )
}
