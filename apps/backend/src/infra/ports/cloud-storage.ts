import type { UploadImageInput } from '@/@types/r2-storage'

export interface CloudStorage {
  deleteOldImages(prefix: string): Promise<void>
  uploadImage(uploadImageInput: UploadImageInput): Promise<{ url: string }>
}
