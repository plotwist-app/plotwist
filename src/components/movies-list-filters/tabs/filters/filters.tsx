import { GenresField, LanguageField, ReleaseDateField } from './(fields)'

export const Filters = () => {
  return (
    <div className="space-y-4">
      <GenresField />
      <ReleaseDateField />
      <LanguageField />
    </div>
  )
}
