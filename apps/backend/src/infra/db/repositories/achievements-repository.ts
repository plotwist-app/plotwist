import { and, asc, eq } from 'drizzle-orm'
import { db } from '..'
import { schema } from '../schema'
import type { AchievementCriteria, I18nField } from '../schema/achievements'

export async function selectAllAchievements() {
  return db
    .select()
    .from(schema.achievements)
    .orderBy(asc(schema.achievements.sortOrder))
}

export async function selectActiveAchievements() {
  return db
    .select()
    .from(schema.achievements)
    .where(eq(schema.achievements.isActive, true))
    .orderBy(asc(schema.achievements.sortOrder))
}

export async function selectAchievementById(id: string) {
  const [achievement] = await db
    .select()
    .from(schema.achievements)
    .where(eq(schema.achievements.id, id))
  return achievement ?? null
}

export async function insertAchievement(values: {
  slug: string
  icon: string
  target: number
  category: 'general' | 'saga'
  level: number
  criteria: AchievementCriteria
  name: I18nField
  description: I18nField
  sortOrder: number
  isActive: boolean
}) {
  const [achievement] = await db
    .insert(schema.achievements)
    .values(values)
    .returning()
  return achievement
}

export async function updateAchievement(
  id: string,
  values: Partial<{
    slug: string
    icon: string
    target: number
    category: 'general' | 'saga'
    level: number
    criteria: AchievementCriteria
    name: I18nField
    description: I18nField
    sortOrder: number
    isActive: boolean
  }>
) {
  const [achievement] = await db
    .update(schema.achievements)
    .set({ ...values, updatedAt: new Date() })
    .where(eq(schema.achievements.id, id))
    .returning()
  return achievement ?? null
}

export async function deleteAchievement(id: string) {
  const [achievement] = await db
    .delete(schema.achievements)
    .where(eq(schema.achievements.id, id))
    .returning()
  return achievement ?? null
}

export async function selectUserAchievements(userId: string) {
  return db
    .select()
    .from(schema.userAchievements)
    .where(eq(schema.userAchievements.userId, userId))
}

export async function selectUserAchievement(
  userId: string,
  achievementId: string
) {
  const [ua] = await db
    .select()
    .from(schema.userAchievements)
    .where(
      and(
        eq(schema.userAchievements.userId, userId),
        eq(schema.userAchievements.achievementId, achievementId)
      )
    )
  return ua ?? null
}

export async function upsertUserAchievement(values: {
  userId: string
  achievementId: string
  isClaimed: boolean
  isEquipped: boolean
  claimedAt: Date | null
}) {
  const [ua] = await db
    .insert(schema.userAchievements)
    .values(values)
    .onConflictDoUpdate({
      target: [
        schema.userAchievements.userId,
        schema.userAchievements.achievementId,
      ],
      set: {
        isClaimed: values.isClaimed,
        isEquipped: values.isEquipped,
        claimedAt: values.claimedAt,
        updatedAt: new Date(),
      },
    })
    .returning()
  return ua
}

export async function updateUserAchievementEquip(
  userId: string,
  achievementId: string,
  isEquipped: boolean
) {
  const [ua] = await db
    .update(schema.userAchievements)
    .set({ isEquipped, updatedAt: new Date() })
    .where(
      and(
        eq(schema.userAchievements.userId, userId),
        eq(schema.userAchievements.achievementId, achievementId)
      )
    )
    .returning()
  return ua ?? null
}
