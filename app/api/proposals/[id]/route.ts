import { NextResponse } from 'next/server'
import { requireAuth, isAuthError } from '@/lib/auth'
import { findProposal } from '@/lib/proposals/queries'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()
  if (isAuthError(auth)) return auth

  const { id } = await params
  const proposal = await findProposal(id)
  if (!proposal) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (proposal.userId !== auth.userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  return NextResponse.json(proposal)
}
