export function formatNumber(num: number): string {
  const units = ['k', 'm', 'b', 't']
  let unitIndex = -1
  let scaledNum = num

  while (scaledNum >= 1000 && unitIndex < units.length - 1) {
    scaledNum /= 1000
    unitIndex++
  }

  return unitIndex === -1
    ? num.toString()
    : `${scaledNum % 1 === 0 ? scaledNum : scaledNum.toFixed(1)}${
        units[unitIndex]
      }`
}
