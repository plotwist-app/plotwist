export const tmdbImage = (
  path: string,
  type: 'original' | 'w500' = 'original',
) => `https://image.tmdb.org/t/p/${type}/${path}`
