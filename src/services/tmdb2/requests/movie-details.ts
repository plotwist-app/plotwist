import { tmdbClient } from '..'

export const movieDetails = async (id: number) => {
  try {
    const { data } = await tmdbClient.get(`/movie/${id}`)

    return data
  } catch (e) {
    console.log(e)
  }
}
