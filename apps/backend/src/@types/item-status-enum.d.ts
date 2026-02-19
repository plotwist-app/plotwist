import type { statusEnum } from '@/infra/db/schema'

export type UserItemStatus = (typeof statusEnum)['enumValues'][number]
