import { MediaTypeField, RatingField } from './(fields)'

export const Filters = () => {
  return (
    <div className="space-y-4">
      <MediaTypeField />
      <RatingField />
    </div>
  )
}
