'use client'

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
  const { theme } = useTheme()

  const [activeIndex, setActiveIndex] = useState(0)
  const images = GET_IMAGES(theme ?? 'light')

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % images.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [images])

  return (
    <section className="relative max-w-6xl mx-auto ">
      <div className="border rounded-lg aspect-[1629/831] relative overflow-hidden bg-background z-20 max-w-3xl mx-auto">
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
      </div>
    </section>
  )
}
