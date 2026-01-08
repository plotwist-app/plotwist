import { getImportMovie } from '@/db/repositories/import-movies-repository'

export async function getImportMovieById(id: string) {
  const movie = getImportMovie(id)

  return movie
}
