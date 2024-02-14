import { GenresField } from './fields/genres'
import { ReleaseDateField } from './fields/release-date'

export const Filters = () => {
  return (
    <div className="space-y-4">
      <GenresField />
      <ReleaseDateField />

      {/* <FormField
        control={control}
        name="language"
        render={() => (
          <FormItem>
            <FormLabel>Idioma</FormLabel>
            <FormControl></FormControl>
            <FormDescription>
              Filtra os resultados pelo idioma original.
            </FormDescription>

            <FormMessage />
          </FormItem>
        )}
      />

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
