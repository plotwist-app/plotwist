import { z } from 'zod'
import type { Dictionary } from '@/utils/dictionaries'

export const listFormSchema = (dictionary: Dictionary) =>
  z.object({
    title: z.string().min(1, dictionary.list_form.name_required),
    description: z.string(),
    visibility: z.enum(['PUBLIC', 'NETWORK', 'PRIVATE']),
  })

export type ListFormValues = z.infer<ReturnType<typeof listFormSchema>>
