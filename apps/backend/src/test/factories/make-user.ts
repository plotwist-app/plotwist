import { randomUUID } from 'node:crypto'
import { faker } from '@faker-js/faker'
import type { InsertUserModel, User } from '@/domain/entities/user'
import { insertUser } from '@/infra/db/repositories/user-repository'

type Overrides = Partial<InsertUserModel>

export function makeRawUser(overrides: Overrides = {}) {
  return {
    email: buildEmail(),
    password: faker.internet.password(),
    username: faker.internet.username(),
    ...overrides,
  }
}

export async function makeUser(overrides: Overrides = {}): Promise<User> {
  const [user] = await insertUser(makeRawUser(overrides))

  return user
}

function buildEmail() {
  const baseEmail = faker.internet.email()
  const email = `${randomUUID()}${baseEmail}`

  return email
}

export async function makeUserReturningId(
  overrides: Overrides = {}
): Promise<string> {
  const { id } = await makeUser(overrides)

  return id
}
