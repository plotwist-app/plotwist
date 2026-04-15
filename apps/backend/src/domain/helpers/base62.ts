const BASE62_ALPHABET =
  '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

/**
 * Encode a positive integer to base62.
 * With salt: (id + salt) is encoded so the sequence is not guessable.
 */
export function base62Encode(id: number, salt: number = 0): string {
  let n = id + salt
  if (n < 0) n = 0
  if (n === 0) return BASE62_ALPHABET[0] ?? '0'

  let s = ''
  const base = BASE62_ALPHABET.length
  while (n > 0) {
    const char = BASE62_ALPHABET[n % base]
    s = (char ?? '0') + s
    n = Math.floor(n / base)
  }
  return s
}
