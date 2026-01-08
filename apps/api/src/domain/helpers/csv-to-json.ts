import type { MultipartFile } from '@fastify/multipart'
import { processZipFile } from './decompress-zip-file'

function parseCsvToJson(csvContent: string): Record<string, string>[] {
  const lines = csvContent.trim().split('\n')

  const headers = lines[0].split(',').map(header => header.trim())

  const rows = lines.slice(1).map(line => {
    const values = line.split(',').map(value => value.trim())

    return headers.reduce(
      (acc, header, index) => {
        acc[header] = values[index] || ''
        return acc
      },
      {} as Record<string, string>
    )
  })

  return rows
}

export async function processAndConvertZipFile(
  uploadedFile: MultipartFile
): Promise<Map<string, Record<string, string>[]>> {
  const unzippedContent = await processZipFile(uploadedFile)

  const jsonMap = new Map<string, Record<string, string>[]>()

  unzippedContent.forEach((csvContent, filename) => {
    const parsedJson = parseCsvToJson(csvContent)
    jsonMap.set(filename, parsedJson)
  })

  return jsonMap
}
