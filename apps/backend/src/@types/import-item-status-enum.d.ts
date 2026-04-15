import type { importItemStatusEnum } from '@/infra/db/schema'

export type ImportStatusEnum =
  (typeof importItemStatusEnum)['enumValues'][number]
