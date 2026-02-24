/**
 * Process items in batches with concurrency control to avoid rate limiting.
 * TMDB API allows ~40-50 requests per 10 seconds.
 * Using batches of 10 with 250ms delay provides safe throughput.
 */
export async function processInBatches<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  options: {
    batchSize?: number
    delayBetweenBatches?: number
  } = {}
): Promise<R[]> {
  const { batchSize = 10, delayBetweenBatches = 250 } = options
  const results: R[] = []

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    const batchResults = await Promise.all(batch.map(processor))
    results.push(...batchResults)

    // Add delay between batches (not after the last batch)
    if (i + batchSize < items.length) {
      await sleep(delayBetweenBatches)
    }
  }

  return results
}

/**
 * Process items in batches and collect results into a Map.
 * Useful for aggregating counts like genres, countries, etc.
 */
export async function processInBatchesWithAggregation<T, K>(
  items: T[],
  processor: (item: T) => Promise<K[] | undefined>,
  options: {
    batchSize?: number
    delayBetweenBatches?: number
  } = {}
): Promise<Map<K, number>> {
  const { batchSize = 10, delayBetweenBatches = 250 } = options
  const countMap = new Map<K, number>()

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)

    await Promise.all(
      batch.map(async item => {
        const results = await processor(item)
        if (results) {
          for (const result of results) {
            const currentCount = countMap.get(result) || 0
            countMap.set(result, currentCount + 1)
          }
        }
      })
    )

    // Add delay between batches (not after the last batch)
    if (i + batchSize < items.length) {
      await sleep(delayBetweenBatches)
    }
  }

  return countMap
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
