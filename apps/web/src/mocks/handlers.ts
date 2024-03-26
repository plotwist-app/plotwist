import { HttpResponse, http } from 'msw'

import { credits } from './tmdb/movie/credits'
import { images } from './tmdb/movie/images'
import { videos } from './tmdb/movie/videos'
import { watchProviders } from './tmdb/movie/watch-providers'

export const handlers = [
  http.get('https://api.themoviedb.org/3/movie/673/credits', () => {
    return HttpResponse.json(credits, { status: 200 })
  }),

  http.get('https://api.themoviedb.org/3/movie/673/images', () => {
    return HttpResponse.json(images, { status: 200 })
  }),

  http.get('https://api.themoviedb.org/3/movie/673/videos', () => {
    return HttpResponse.json(videos, { status: 200 })
  }),

  http.get('https://api.themoviedb.org/3/movie/673/watch/providers', () => {
    return HttpResponse.json(watchProviders, { status: 200 })
  }),
]
