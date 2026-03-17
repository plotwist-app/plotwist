import { z } from 'zod'

export const languageQuerySchema = z.object({
  language: z
    .enum(['en-US', 'es-ES', 'fr-FR', 'de-DE', 'it-IT', 'pt-BR', 'ja-JP'])
    .optional()
    .default('en-US'),
})

export const paginationQuerySchema = z.object({
  cursor: z.string().optional(),
  pageSize: z.string().default('20'),
})

export const languageWithLimitQuerySchema = z.object({
  language: z
    .enum(['en-US', 'es-ES', 'fr-FR', 'de-DE', 'it-IT', 'pt-BR', 'ja-JP'])
    .optional()
    .default('en-US'),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
})

const yearMonthRegex = /^\d{4}-(0[1-9]|1[0-2])$/

export const periodQuerySchema = z.object({
  period: z
    .union([
      z.enum(['month', 'last_month', 'year', 'all']),
      z.string().regex(yearMonthRegex),
    ])
    .optional()
    .default('all'),
})

export const languageWithPeriodQuerySchema =
  languageQuerySchema.merge(periodQuerySchema)

export const languageWithLimitAndPeriodQuerySchema =
  languageWithLimitQuerySchema.merge(periodQuerySchema)

export const timelineQuerySchema = z.object({
  language: z
    .enum(['en-US', 'es-ES', 'fr-FR', 'de-DE', 'it-IT', 'pt-BR', 'ja-JP'])
    .optional()
    .default('en-US'),
  cursor: z.string().regex(yearMonthRegex).optional(),
  pageSize: z.coerce.number().int().min(1).max(10).optional().default(3),
})

export type StatsPeriod = z.infer<typeof periodQuerySchema>['period']

export function periodToDateRange(period: StatsPeriod): {
  startDate: Date | undefined
  endDate: Date | undefined
} {
  if (typeof period === 'string' && yearMonthRegex.test(period)) {
    const [year, month] = period.split('-').map(Number)
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59, 999)
    return { startDate, endDate }
  }

  const now = new Date()
  switch (period) {
    case 'month': {
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      return { startDate, endDate: undefined }
    }
    case 'last_month': {
      const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const endDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        0,
        23,
        59,
        59,
        999
      )
      return { startDate, endDate }
    }
    case 'year': {
      const startDate = new Date(now.getFullYear(), 0, 1)
      return { startDate, endDate: undefined }
    }

    default:
      return { startDate: undefined, endDate: undefined }
  }
}
