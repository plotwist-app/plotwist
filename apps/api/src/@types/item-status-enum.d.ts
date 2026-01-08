import type { statusEnum } from '@/db/schema'

export type UserItemStatus = (typeof statusEnum)['enumValues'][number]
