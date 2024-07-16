'use client'

import { useEffect, useRef } from 'react'

const Video = () => {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.2
    }
  }, [])

  return (
    <video
      ref={videoRef}
      className="brightness-70 h-full w-full bg-muted object-cover dark:brightness-[30%]"
      autoPlay
      muted
      loop
    >
      <source src="/gargantua.mp4" />
    </video>
  )
}

export default Video
