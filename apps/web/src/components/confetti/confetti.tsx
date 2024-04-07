'use client'

import React from 'react'
import ReactConfetti from 'react-confetti'
import { useWindowSize } from '@uidotdev/usehooks'

export const Confetti = () => {
  const { width, height } = useWindowSize()

  return (
    <ReactConfetti
      width={width! - 18}
      height={height!}
      style={{ zIndex: 999 }}
      recycle={false}
      numberOfPieces={500}
    />
  )
}
