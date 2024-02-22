import { Dictionary } from '@/utils/dictionaries'
import { z } from 'zod'

export const listFormSchema = (dictionary: Dictionary) =>
  z.object({
    name: z.string().min(1, dictionary.create_new_list_form.name_required),
    description: z.string(),
  })

export type ListFormValues = z.infer<ReturnType<typeof listFormSchema>>
