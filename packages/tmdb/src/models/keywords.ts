export type Keyword = {
  name: string
  id: number
}

export type GetKeywordsResponse = {
  id: number
  results?: Array<Keyword>
  keywords?: Array<Keyword>
}
