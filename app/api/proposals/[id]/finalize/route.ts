import { NextResponse } from 'next/server'
import { requireAuth, isAuthError } from '@/lib/auth'
import { finalizeProposal } from '@/lib/proposals/service'

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()
  if (isAuthError(auth)) return auth

  const { id } = await params

  try {
    const proposal = await finalizeProposal(id, auth.userId)
    return NextResponse.json(proposal)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Finalize failed'
    const status = msg.includes('Not found') ? 404
      : msg.includes('Forbidden') ? 403
      : msg.includes('Cannot finalize') ? 422
      : 500
    return NextResponse.json({ error: msg }, { status })
  }
}
