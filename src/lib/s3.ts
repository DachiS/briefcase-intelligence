// src/lib/s3.ts
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const BUCKET = process.env.AWS_S3_BUCKET!

// Generate a pre-signed URL for uploading (used in admin)
export async function getUploadPresignedUrl(key: string, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  })
  return getSignedUrl(s3Client, command, { expiresIn: 3600 })
}

// Generate a pre-signed URL for reading a PDF (short-lived, secure)
export async function getPDFReadUrl(key: string) {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ResponseContentDisposition: 'inline',
    ResponseContentType: 'application/pdf',
  })
  // URL valid for 2 hours
  return getSignedUrl(s3Client, command, { expiresIn: 7200 })
}

// Fetch a PDF object's bytes server-side (for watermarking before delivery).
export async function getPDFBuffer(key: string): Promise<Buffer> {
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: key })
  const res = await s3Client.send(command)
  if (!res.Body) throw new Error('S3 object has no body')
  const bytes = await res.Body.transformToByteArray()
  return Buffer.from(bytes)
}

// Delete an object
export async function deleteS3Object(key: string) {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: key,
  })
  await s3Client.send(command)
}

// Generate a unique S3 key for a new issue PDF
export function generateIssueKey(issueNumber: number): string {
  return `issues/issue-${issueNumber}-${Date.now()}.pdf`
}

// Generate key for cover image
export function generateCoverKey(issueNumber: number, ext: string): string {
  return `covers/issue-${issueNumber}-${Date.now()}.${ext}`
}
