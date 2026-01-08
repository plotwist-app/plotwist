import type { MultipartFile } from '@fastify/multipart'
import AdmZip from 'adm-zip'

export async function processZipFile(
  uploadedFile: MultipartFile
): Promise<Map<string, string>> {
  try {
    const zipBuffer = await uploadedFile.toBuffer()

    const zip = new AdmZip(zipBuffer)

    const fileContents = new Map<string, string>()

    for (const entry of zip.getEntries()) {
      if (!entry.isDirectory) {
        const content = entry.getData().toString('utf-8')
        fileContents.set(entry.entryName, content)
      }
    }

    return fileContents
  } catch (error) {
    console.error('Erro ao processar o arquivo ZIP:', error)
    throw new Error('Erro ao processar o arquivo ZIP')
  }
}
