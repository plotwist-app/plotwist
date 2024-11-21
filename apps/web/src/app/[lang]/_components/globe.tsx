'use client'

import createGlobe from 'cobe'
import { useTheme } from 'next-themes'
import { useEffect, useRef, useState } from 'react'

export const Globe = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const { theme } = useTheme()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const updateDimensions = () => {
      setDimensions({
        width: canvas.width,
        height: canvas.height,
      })
    }

    const resizeObserver = new ResizeObserver(() => {
      updateDimensions()
    })

    resizeObserver.observe(canvas)
    updateDimensions()

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    let phi = 0

    if (canvasRef.current) {
      const globe = createGlobe(canvasRef.current, {
        devicePixelRatio: 2,
        width: dimensions.width,
        height: dimensions.height,
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
        onRender: state => {
          state.phi = phi
          phi += 0.01
        },
      })

      return () => {
        globe.destroy()
      }
    }
  }, [theme, canvasRef, dimensions])

  return (
    <canvas
      ref={canvasRef}
      className="aspect-square h-full w-full max-w-full"
    />
  )
}
