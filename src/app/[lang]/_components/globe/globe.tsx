'use client'

import createGlobe from 'cobe'
import { useTheme } from 'next-themes'
import { useEffect, useRef } from 'react'

export const Globe = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { theme } = useTheme()

  useEffect(() => {
    let phi = 0

    if (canvasRef.current) {
      const globe = createGlobe(canvasRef.current, {
        devicePixelRatio: 2,
        width: canvasRef.current.width,
        height: canvasRef.current.height,
        phi: 0,
        theta: 0,
        dark: theme === 'dark' ? 1 : 0,
        diffuse: 1.2,
        mapSamples: 16000,
        mapBrightness: 6,
        baseColor: [1, 1, 1],
        glowColor: theme === 'dark' ? [0.1, 0.1, 0.1] : [1, 1, 1],
        markerColor: theme === 'dark' ? [1, 1, 1] : [0, 0, 0],
        markers: [
          { location: [38.9072, -77.0369], size: 0.07 },
          { location: [40.4168, -3.7038], size: 0.07 },
          { location: [48.8566, 2.3522], size: 0.07 },
          { location: [52.52, 13.405], size: 0.07 },
          { location: [41.9028, 12.4964], size: 0.07 },
          { location: [-15.827, -47.922], size: 0.07 },
          { location: [35.6895, 139.6917], size: 0.07 },
        ],
        opacity: 0.8,
        onRender: (state) => {
          state.phi = phi
          phi += 0.01
        },
      })

      return () => {
        globe.destroy()
      }
    }
  }, [theme])

  return (
    <canvas
      ref={canvasRef}
      className="aspect-square h-full w-full max-w-full"
    />
  )
}
