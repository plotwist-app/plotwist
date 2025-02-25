'use client'

import { Skeleton } from '@plotwist/ui/components/ui/skeleton'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import { useState, useEffect } from 'react'

const GET_IMAGES = (theme: string) => {
  return [
    `/images/landing-page/${theme}/activity.jpg`,
    `/images/landing-page/${theme}/collection.jpg`,
    `/images/landing-page/${theme}/reviews.jpg`,
    `/images/landing-page/${theme}/stats.jpg`,
    `/images/landing-page/${theme}/preferences.jpg`,
  ]
}

export function Images() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const currentTheme = resolvedTheme || 'light'
  const images = GET_IMAGES(currentTheme)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % images.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [images])

  if (!mounted) {
    return (
      <section className="border rounded-lg aspect-[1629/831] bg-background z-20 max-w-4xl mx-auto">
        <Skeleton className="w-full h-full" />
      </section>
    )
  }

  return (
    <section className="border rounded-lg aspect-[1629/831] relative overflow-hidden bg-background z-20 max-w-4xl mx-auto shadow">
      {images.map((image, index) => (
        <Image
          key={image}
          src={image}
          alt={`Image ${index + 1}`}
          fill
          className={`
              object-cover 
              absolute 
              top-0 
              left-0 
              transition-opacity 
              duration-500
              ${activeIndex === index ? 'opacity-100' : 'opacity-0'}
            `}
          priority
        />
      ))}
    </section>
  )
}
