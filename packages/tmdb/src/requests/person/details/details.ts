import { DetailedPerson } from '.'
import { Language, axiosClient } from '../../..'

export const details = async (personId: number, language: Language) => {
  const { data } = await axiosClient.get<DetailedPerson>(
    `/person/${personId}`,
    {
      params: {
        language,
      },
    },
  )

  return data
}
