import { axiosClient } from ".."
import { GetLanguagesResponse } from "../models/language"

export const languages = async () => {
  const { data } = await axiosClient.get<GetLanguagesResponse>('/configuration/languages')

  return data
}
