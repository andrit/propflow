import { NextResponse } from 'next/server'
import { requireAuth, isAuthError } from '@/lib/auth'
import { shareProposal } from '@/lib/proposals/service'

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()
  if (isAuthError(auth)) return auth

  const { id } = await params

  try {
    const token = await shareProposal(id, auth.userId)
    return NextResponse.json({ token, url: `${process.env.NEXT_PUBLIC_APP_URL}/p/${token}` })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Share failed'
    return NextResponse.json({ error: msg }, { status: 422 })
  }
}
