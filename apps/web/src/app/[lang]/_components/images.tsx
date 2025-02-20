'use client'

import { useTheme } from 'next-themes'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { v4 } from 'uuid'
import { Reviews } from './reviews'

const GET_IMAGES = (theme: string) => {
  return [
    `/images/lp/${theme}/activity.jpg`,
    `/images/lp/${theme}/collection.jpg`,
    `/images/lp/${theme}/lists.jpg`,
    `/images/lp/${theme}/reviews.jpg`,
    `/images/lp/${theme}/stats.jpg`,
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
    <section className="relative max-w-6xl mx-auto">
      <Reviews />
      <div className="border rounded-lg aspect-video relative overflow-hidden bg-background z-20 max-w-3xl mx-auto">
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

      <div className="absolute right-0 bottom-0 aspect-[9/16] border w-1/5 z-40 rounded-lg bg-background flex justify-center items-center overflow-hidden pointer-events-none">
        <Image
          src="/images/landing-page/dark/tv.jpg"
          alt="Breaking Bad page image"
          fill
          className="object-cover dark:block hidden"
          quality={100}
        />

        <Image
          src="/images/landing-page/light/tv.jpg"
          alt="Breaking Bad page image"
          fill
          className="object-cover dark:hidden drag"
          quality={100}
        />
      </div>
    </section>
  )
}
