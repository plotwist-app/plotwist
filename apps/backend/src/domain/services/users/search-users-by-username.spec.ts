import { randomUUID } from 'node:crypto'
import { searchUsersByUsername } from '@/domain/services/users/search-users-by-username'
import { makeFollow } from '@/test/factories/make-follow'
import { makeUser } from '@/test/factories/make-user'

it('should search users by username', async () => {
  const user = await makeUser()
  await makeUser()
  await makeUser()

  const username = user.username.split(':')[0]

  const result = await searchUsersByUsername(username)

  expect(result).toHaveLength(1)
  expect(result[0].id).toEqual(user.id)
})

it('should search users by username with partial match', async () => {
  const user = await makeUser()
  const username = user.username.split(':')[0]

  await makeUser({ username: buildUsername(username) })

  const result = await searchUsersByUsername(username)

  expect(result).toHaveLength(2)
})

it('should return followed users first', async () => {
  const mainUser = await makeUser()
  const username = buildUsername('elixir')

  const users = []
  for (let i = 0; i < 10; i++) {
    users.push(await makeUser({ username: buildUsername(username) }))
  }

  const followed = users[users.length - 1]

  await makeFollow({ followerId: mainUser.id, followedId: followed.id })

  const result = await searchUsersByUsername(username)

  expect(result).toHaveLength(10)
  expect(result[0].id).toEqual(followed.id)
  expect(result[0].isFollowed).toEqual(true)
})

it('should return only 10 users', async () => {
  const username = buildUsername('lui7henrique')

  const users = []
  for (let i = 0; i < 12; i++) {
    users.push(await makeUser({ username: buildUsername(username) }))
  }

  const result = await searchUsersByUsername(username)

  expect(result).toHaveLength(10)
})

it('should return empty array if no users are found', async () => {
  const result = await searchUsersByUsername('invalid-username')

  expect(result).toHaveLength(0)
})

function buildUsername(username: string) {
  return `${username}:${randomUUID()}`
}
