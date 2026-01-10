import type { providersEnum } from '@/db/schema'

export type ProvidersEnum = (typeof providersEnum)['enumValues'][number]
