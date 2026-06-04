import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { proposals } from '@/lib/db/schema'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { r2Keys } from '@/lib/r2'

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId:     process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

export async function generatePdf(proposalId: string, userId: string): Promise<void> {
  const renderUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/proposals/${proposalId}/render?secret=${process.env.RENDER_SECRET}`

  let browser
  try {
    // Dynamic import — puppeteer is only available in the Node.js runtime
    const puppeteer = await import('puppeteer')
    browser = await puppeteer.default.launch({
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH ?? '/usr/bin/chromium',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      headless: true,
    })

    const page = await browser.newPage()
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 })
    await page.goto(renderUrl, { waitUntil: 'networkidle0', timeout: 30_000 })
    await page.waitForFunction(() => document.fonts.ready, { timeout: 10_000 })

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    })

    const key = r2Keys.proposal(userId, proposalId)
    await r2.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      Body: pdfBuffer,
      ContentType: 'application/pdf',
    }))

    await db.update(proposals)
      .set({ pdfR2Key: key, updatedAt: new Date() })
      .where(eq(proposals.id, proposalId))
  } finally {
    await browser?.close()
  }
}
