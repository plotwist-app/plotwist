import type { Readable } from 'node:stream'

export type UploadImageInput = {
  path: string
  contentType: string
  contentStream: Readable
}
