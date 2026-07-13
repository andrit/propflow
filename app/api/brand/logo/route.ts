import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, isAuthError } from '@/lib/auth'
import { saveLogo, deleteLogo, getBrand } from '@/lib/brand/service'
import { uploadBuffer, deleteFile, r2Keys, getReadUrl } from '@/lib/r2'

const MAX_BYTES = 1 * 1024 * 1024
const ALLOWED_TYPES = new Set(['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'])

function extFor(mime: string): string {
  if (mime === 'image/svg+xml') return 'svg'
  if (mime === 'image/png')     return 'png'
  if (mime === 'image/webp')    return 'webp'
  return 'jpg'
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth()
  if (isAuthError(auth)) return auth

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: 'Must be PNG, JPG, SVG, or WebP' }, { status: 400 })
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'Logo must be under 1 MB' }, { status: 400 })
  }

  const key = r2Keys.logo(auth.userId, extFor(file.type))
  const buffer = Buffer.from(await file.arrayBuffer())

  try {
    await uploadBuffer(key, buffer, file.type)
    const brand = await saveLogo(auth.userId, key, auth.tier)
    const logoUrl = await getReadUrl(key)
    return NextResponse.json({ ...brand, logoUrl })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Upload failed'
    const status = msg.includes('Pro') || msg.includes('tier') ? 403 : 500
    return NextResponse.json({ error: msg }, { status })
  }
}

export async function DELETE() {
  const auth = await requireAuth()
  if (isAuthError(auth)) return auth

  const brand = await getBrand(auth.userId)
  if (brand?.logoR2Key) {
    await deleteFile(brand.logoR2Key)
  }
  const updated = await deleteLogo(auth.userId)
  return NextResponse.json({ ...updated, logoUrl: null })
}
