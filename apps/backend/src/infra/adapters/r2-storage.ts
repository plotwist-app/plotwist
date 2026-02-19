import {
  DeleteObjectsCommand,
  ListObjectsV2Command,
  S3Client,
} from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import type { UploadImageInput } from '@/@types/r2-storage'
import { config } from '@/config'
import type { CloudStorage } from '@/infra/ports/cloud-storage'

const r2Storage = new S3Client({
  region: 'auto',
  endpoint: `https://${config.cloudflare.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: config.cloudflare.CLOUDFLARE_ACCESS_KEY_ID,
    secretAccessKey: config.cloudflare.CLOUDFLARE_SECRET_ACCESS_KEY,
  },
})

async function deleteOldImages(prefix: string) {
  try {
    const listCommand = new ListObjectsV2Command({
      Bucket: config.cloudflare.CLOUDFLARE_BUCKET,
      Prefix: prefix,
    })

    const listResponse = await r2Storage.send(listCommand)

    if (!listResponse.Contents || listResponse.Contents.length === 0) {
      return
    }

    const objectsToDelete = listResponse.Contents.map(object => ({
      Key: object.Key,
    }))

    const deleteCommand = new DeleteObjectsCommand({
      Bucket: config.cloudflare.CLOUDFLARE_BUCKET,
      Delete: {
        Objects: objectsToDelete,
        Quiet: true,
      },
    })

    await r2Storage.send(deleteCommand)
  } catch (error) {
    throw new Error(
      `Unable to delete old images for user: prefix: ${prefix}, error: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}

async function uploadImage({
  path,
  contentType,
  contentStream,
}: UploadImageInput) {
  const key = path

  const upload = new Upload({
    client: r2Storage,
    params: {
      Key: key,
      Bucket: config.cloudflare.CLOUDFLARE_BUCKET,
      Body: contentStream,
      ContentType: contentType,
    },
  })

  await upload.done()

  return {
    url: new URL(key, config.cloudflare.CLOUDFLARE_PUBLIC_URL).toString(),
  }
}

const R2Storage: CloudStorage = {
  deleteOldImages: prefix => deleteOldImages(prefix),
  uploadImage: uploadImageInput => uploadImage(uploadImageInput),
}

export { R2Storage }
