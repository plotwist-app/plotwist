import { R2Storage } from '@/infra/adapters/r2-storage'
import type { CloudStorage } from '@/infra/ports/cloud-storage'

type CloudProvider = 'R2' | 'S3'

export function createCloudStorage(provider: CloudProvider): CloudStorage {
  switch (provider) {
    case 'R2':
      return R2Storage

    // case 'S3':
    // return S3Storage

    default:
      throw new Error(`Unsupported cloud storage provider: ${provider}`)
  }
}
