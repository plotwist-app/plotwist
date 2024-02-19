import { Dictionary } from '@/utils/dictionaries'
import { z } from 'zod'

export const createNewListFormSchema = (dictionary: Dictionary) =>
  z.object({
    name: z.string().min(1, dictionary.create_new_list_form.name_required),

    description: z
      .string()
      .min(1, dictionary.create_new_list_form.description_required),
  })

export type CreateNewListFormValues = z.infer<
  ReturnType<typeof createNewListFormSchema>
>
