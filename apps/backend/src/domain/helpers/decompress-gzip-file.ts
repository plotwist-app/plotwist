import { Readable } from 'node:stream'
import { createGunzip } from 'node:zlib'
import type { MultipartFile } from '@fastify/multipart'
import { CannotUnzipFileError } from '../errors/cannot-unzip-file'

export async function unzipFile(uploadedFile: MultipartFile) {
  try {
    const fileStream = Readable.from(uploadedFile.file)

    const gunzip = createGunzip()

    const unzippedStream = fileStream.pipe(gunzip)

    const chunks: Buffer[] = []
    for await (const chunk of unzippedStream) {
      chunks.push(chunk)
    }

    const unzippedContent = Buffer.concat(chunks).toString('utf-8')
    return unzippedContent
  } catch (error) {
    console.error(error)
    throw new CannotUnzipFileError()
  }
}
