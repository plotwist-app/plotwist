import type { providersEnum } from '@/infra/db/schema'

export type ProvidersEnum = (typeof providersEnum)['enumValues'][number]
