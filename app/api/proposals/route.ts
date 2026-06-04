import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, isAuthError } from '@/lib/auth'
import { listProposals } from '@/lib/proposals/queries'
import { createProposal } from '@/lib/proposals/service'
import { CreateProposalSchema } from '@/lib/proposals/schemas'

export async function GET() {
  const auth = await requireAuth()
  if (isAuthError(auth)) return auth

  const proposals = await listProposals(auth.userId)
  return NextResponse.json(proposals)
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth()
  if (isAuthError(auth)) return auth

  const body = await request.json()
  const parsed = CreateProposalSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  try {
    const proposal = await createProposal(parsed.data, auth.userId, auth.tier)
    return NextResponse.json(proposal, { status: 201 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to create proposal'
    const status = msg.includes('limit') ? 403 : 500
    return NextResponse.json({ error: msg }, { status })
  }
}
