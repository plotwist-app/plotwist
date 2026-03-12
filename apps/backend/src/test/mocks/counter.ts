import type { Counter } from '@/infra/ports/counter'

/**
 * Global sequence shared across all in-memory counter instances in the same
 * test process. Seeded with pid so each Vitest worker gets a different offset—
 * otherwise parallel workers both start at 1 and produce duplicate short codes.
 */
let globalSequence = (process.pid ?? 0) * 1_000_000

export function createInMemoryCounter(): Counter {
  let initialSet = false

  return {
    async nextId() {
      globalSequence += 1
      return globalSequence
    },
    async setInitialIfAbsent(initialValue: number) {
      if (initialSet) return false
      globalSequence = initialValue
      initialSet = true
      return true
    },
  }
}
