export function getRandomItems<T>(array: T[], count: number): T[] {
  const maxStartIndex = array.length - count
  const startIndex = Math.floor(Math.random() * (maxStartIndex + 1))

  return array.slice(startIndex, startIndex + count)
}
