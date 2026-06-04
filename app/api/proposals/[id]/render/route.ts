import { NextRequest, NextResponse } from 'next/server'
import { clerkClient } from '@clerk/nextjs/server'
import { findProposal } from '@/lib/proposals/queries'
import { getBrand } from '@/lib/brand/service'
import { generateProposalHtml } from '@/lib/pdf/template'
import type { Tier } from '@/lib/tiers'

// Internal-only route: called by the Puppeteer PDF generator.
// Authenticated by RENDER_SECRET env var — never expose to users.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const secret = request.nextUrl.searchParams.get('secret')
  if (!process.env.RENDER_SECRET || secret !== process.env.RENDER_SECRET) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  const { id } = await params
  const proposal = await findProposal(id)
  if (!proposal) return new NextResponse('Not Found', { status: 404 })

  const brand = await getBrand(proposal.userId)

  const client = await clerkClient()
  const user = await client.users.getUser(proposal.userId)
  const tier = ((user.publicMetadata as Record<string, unknown>)?.tier as Tier) ?? 'free'

  const html = generateProposalHtml(proposal, brand, tier)

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
