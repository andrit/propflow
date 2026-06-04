import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, isAuthError } from '@/lib/auth'
import { updateSection } from '@/lib/proposals/service'
import { UpdateSectionSchema } from '@/lib/proposals/schemas'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sectionId: string }> }
) {
  const auth = await requireAuth()
  if (isAuthError(auth)) return auth

  const { id, sectionId } = await params
  const body = await request.json()
  const parsed = UpdateSectionSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  try {
    const proposal = await updateSection(id, sectionId, parsed.data, auth.userId)
    return NextResponse.json(proposal)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Update failed'
    const status = msg.includes('not found') || msg.includes('Not found') ? 404
      : msg.includes('Forbidden') ? 403
      : msg.includes('finalized') || msg.includes('archived') ? 422
      : 500
    return NextResponse.json({ error: msg }, { status })
  }
}
