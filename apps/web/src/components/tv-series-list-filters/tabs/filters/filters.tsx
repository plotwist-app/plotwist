import {
  AirDateField,
  GenresField,
  LanguageField,
  VoteAverageField,
  VoteCountField,
} from './(fields)'

export const Filters = () => {
  return (
    <div className="space-y-4">
      <GenresField />
      <AirDateField />
      <LanguageField />
      <VoteAverageField />
      <VoteCountField />
    </div>
  )
}
