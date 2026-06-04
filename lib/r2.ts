import { S3Client, DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId:     process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

export const BUCKET = process.env.R2_BUCKET_NAME!
export const APP_SLUG = 'propflow'

export async function getUploadUrl(key: string, contentType: string, size: number): Promise<string> {
  return getSignedUrl(
    r2,
    new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: contentType, ContentLength: size }),
    { expiresIn: 300 }
  )
}

export async function getPdfDownloadUrl(key: string, filename: string, expiresIn = 3600): Promise<string> {
  return getSignedUrl(
    r2,
    new GetObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ResponseContentDisposition: `attachment; filename="${encodeURIComponent(filename)}"`,
      ResponseContentType: 'application/pdf',
    }),
    { expiresIn }
  )
}

export async function readFile(key: string): Promise<Buffer> {
  const response = await r2.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }))
  return Buffer.from(await response.Body!.transformToByteArray())
}

export async function uploadBuffer(key: string, buffer: Buffer, contentType: string): Promise<void> {
  await r2.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: buffer, ContentType: contentType }))
}

export async function deleteFile(key: string): Promise<void> {
  await r2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }))
}

export function assertKeyOwnership(key: string, userId: string): void {
  if (!key.startsWith(`${APP_SLUG}/${userId}/`)) {
    throw new Error('Forbidden')
  }
}

// Key builders — centralise R2 path structure
export const r2Keys = {
  logo:     (userId: string, ext: string) => `${APP_SLUG}/${userId}/brand/logo.${ext}`,
  proposal: (userId: string, proposalId: string) => `${APP_SLUG}/${userId}/proposals/${proposalId}.pdf`,
}
