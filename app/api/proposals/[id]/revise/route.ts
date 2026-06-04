import { NextResponse } from 'next/server'
import { requireAuth, isAuthError } from '@/lib/auth'
import { createRevision } from '@/lib/proposals/service'

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()
  if (isAuthError(auth)) return auth

  const { id } = await params

  try {
    const revision = await createRevision(id, auth.userId)
    return NextResponse.json(revision, { status: 201 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Revision failed'
    const status = msg.includes('Not found') ? 404
      : msg.includes('Forbidden') ? 403
      : msg.includes('finalized') ? 422
      : 500
    return NextResponse.json({ error: msg }, { status })
  }
}
