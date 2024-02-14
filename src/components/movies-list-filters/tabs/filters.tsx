import { LanguageField, ReleaseDateField } from './fields'

export const Filters = () => {
  return (
    <div className="space-y-4">
      <ReleaseDateField />
      <LanguageField />

      {/* 

      <FormField
        control={control}
        name="vote_average"
        render={() => (
          <FormItem>
            <FormLabel>Pontuação do usúario</FormLabel>
            <FormControl></FormControl>

            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="vote_count"
        render={() => (
          <FormItem>
            <FormLabel>Votos mínimos do usuário</FormLabel>
            <FormControl></FormControl>

            <FormMessage />
          </FormItem>
        )}
      /> */}
    </div>
  )
}
