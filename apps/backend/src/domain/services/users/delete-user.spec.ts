import { randomUUID } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { describe, expect, it } from 'vitest'
import { UserNotFoundError } from '@/domain/errors/user-not-found'
import { db } from '@/infra/db'
import { schema } from '@/infra/db/schema'
import { makeUser } from '@/test/factories/make-user'
import { deleteUserService } from './delete-user'

describe('delete user', () => {
  it('should return success when user exists and is deleted', async () => {
    const user = await makeUser({
      email: 'test@example.com',
      username: 'testuser',
      displayName: 'Test User',
      biography: 'Test biography',
    })

    const result = await deleteUserService(user.id)

    expect(result).toEqual({ success: true })
  })

  it('should soft delete user and set deletedAt timestamp', async () => {
    const user = await makeUser()

    await deleteUserService(user.id)

    const [deletedUser] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, user.id))

    expect(deletedUser).toBeTruthy()
    expect(deletedUser?.deletedAt).toBeTruthy()
    expect(deletedUser?.deletedAt).toBeInstanceOf(Date)
  })

  it('should anonymize user email to deleted-{userId}@deleted.local', async () => {
    const user = await makeUser({ email: 'original@example.com' })

    await deleteUserService(user.id)

    const [deletedUser] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, user.id))

    expect(deletedUser?.email).toBe(`deleted-${user.id}@deleted.local`)
  })

  it('should anonymize username to deleted_{userId}', async () => {
    const user = await makeUser({ username: 'originalusername' })

    await deleteUserService(user.id)

    const [deletedUser] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, user.id))

    const expectedUsername = `deleted_${user.id.replace(/-/g, '')}`
    expect(deletedUser?.username).toBe(expectedUsername)
  })

  it('should set displayName, avatarUrl, bannerUrl, and biography to null', async () => {
    const user = await makeUser({
      displayName: 'Display Name',
      biography: 'User biography',
    })

    await deleteUserService(user.id)

    const [deletedUser] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, user.id))

    expect(deletedUser?.displayName).toBeNull()
    expect(deletedUser?.avatarUrl).toBeNull()
    expect(deletedUser?.bannerUrl).toBeNull()
    expect(deletedUser?.biography).toBeNull()
  })

  it('should set password to DELETED', async () => {
    const user = await makeUser()

    await deleteUserService(user.id)

    const [deletedUser] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, user.id))

    expect(deletedUser?.password).toBe('DELETED')
  })

  it('should prevent deleted user from being retrieved via getUserById', async () => {
    const user = await makeUser()

    await deleteUserService(user.id)

    const { getUserById } = await import('./get-by-id')
    const result = await getUserById(user.id)

    expect(result).toBeInstanceOf(UserNotFoundError)
  })

  it('should return UserNotFoundError when user does not exist', async () => {
    const nonExistentUserId = randomUUID()

    const result = await deleteUserService(nonExistentUserId)

    expect(result).toBeInstanceOf(UserNotFoundError)
    expect((result as UserNotFoundError).status).toBe(404)
    expect((result as UserNotFoundError).message).toBe('User not found.')
  })

  it('should keep user id unchanged after deletion for referential integrity', async () => {
    const user = await makeUser()

    await deleteUserService(user.id)

    const [deletedUser] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, user.id))

    expect(deletedUser?.id).toBe(user.id)
  })

  it('should keep createdAt timestamp unchanged after deletion', async () => {
    const user = await makeUser()

    await deleteUserService(user.id)

    const [deletedUser] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, user.id))

    expect(deletedUser?.createdAt).toEqual(user.createdAt)
  })
})
