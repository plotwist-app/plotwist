import type { importItemStatusEnum } from '@/db/schema'

export type ImportStatusEnum =
  (typeof importItemStatusEnum)['enumValues'][number]
