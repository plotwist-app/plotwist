import { DomainError } from '@/domain/errors/domain-error'
import {
  deleteAchievement,
  insertAchievement,
  selectAchievementById,
  selectAllAchievements,
  updateAchievement,
} from '@/infra/db/repositories/achievements-repository'
import type {
  AchievementCriteria,
  I18nField,
} from '@/infra/db/schema/achievements'
import { isUniqueViolation } from '@/infra/db/utils/postgres-errors'

export async function listAchievementsAdmin() {
  return selectAllAchievements()
}

export async function getAchievementAdmin(id: string) {
  const achievement = await selectAchievementById(id)
  if (!achievement) {
    return new DomainError('Achievement not found', 404)
  }
  return achievement
}

interface CreateAchievementInput {
  slug: string
  icon: string
  color: string
  target: number
  category: 'general' | 'saga'
  level: number
  criteria: AchievementCriteria
  name: I18nField
  description: I18nField
  sortOrder: number
  isActive: boolean
}

export async function createAchievementAdmin(input: CreateAchievementInput) {
  try {
    const achievement = await insertAchievement(input)
    return { achievement }
  } catch (error) {
    if (isUniqueViolation(error)) {
      return new DomainError('Achievement with this slug already exists', 409)
    }
    throw error
  }
}

export async function updateAchievementAdmin(
  id: string,
  input: Partial<CreateAchievementInput>
) {
  const existing = await selectAchievementById(id)
  if (!existing) {
    return new DomainError('Achievement not found', 404)
  }

  try {
    const achievement = await updateAchievement(id, input)
    return { achievement }
  } catch (error) {
    if (isUniqueViolation(error)) {
      return new DomainError('Achievement with this slug already exists', 409)
    }
    throw error
  }
}

export async function deleteAchievementAdmin(id: string) {
  const deleted = await deleteAchievement(id)
  if (!deleted) {
    return new DomainError('Achievement not found', 404)
  }
  return { achievement: deleted }
}
