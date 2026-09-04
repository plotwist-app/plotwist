import { createHash, randomBytes } from 'node:crypto'

const ROOM_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function createTogetherToken() {
  return randomBytes(32).toString('hex')
}

export function hashTogetherToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

export function generateRoomCode(length = 6) {
  const bytes = randomBytes(length)
  return Array.from(
    { length },
    (_, index) => ROOM_CODE_ALPHABET[bytes[index] % ROOM_CODE_ALPHABET.length]
  ).join('')
}
