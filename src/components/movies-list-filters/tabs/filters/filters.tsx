import {
  GenresField,
  LanguageField,
  ReleaseDateField,
  VoteAverageField,
  VoteCountField,
} from './(fields)'

export const Filters = () => {
  return (
    <div className="space-y-4">
      <GenresField />
      <ReleaseDateField />
      <LanguageField />
      <VoteAverageField />
      <VoteCountField />
    </div>
  )
}
