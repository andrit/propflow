import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, isAuthError } from '@/lib/auth'
import { getBrand, saveBrand } from '@/lib/brand/service'
import { SaveBrandSchema } from '@/lib/brand/schemas'

export async function GET() {
  const auth = await requireAuth()
  if (isAuthError(auth)) return auth

  const brand = await getBrand(auth.userId)
  return NextResponse.json(brand)
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAuth()
  if (isAuthError(auth)) return auth

  const body = await request.json()
  const parsed = SaveBrandSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  try {
    const brand = await saveBrand(parsed.data, auth.userId, auth.tier)
    return NextResponse.json(brand)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Save failed'
    const status = msg.includes('Pro') || msg.includes('tier') ? 403 : 500
    return NextResponse.json({ error: msg }, { status })
  }
}
