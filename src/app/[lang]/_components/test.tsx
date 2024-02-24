'use client'

import { Button } from '@/components/ui/button'
import { tmdb } from '@/services/tmdb'

export const Test = () => {
  return (
    <Button
      onClick={() => {
        Array.from({ length: 100 }).forEach((_, index) => {
          tmdb.movies.details(index + 1000, 'pt-BR')
        })
      }}
    >
      Test limit request
    </Button>
  )
}
