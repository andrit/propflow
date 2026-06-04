import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { TIERS, type Tier } from './tiers'

interface AuthResult {
  userId: string
  tier: Tier
  stripeCustomerId: string | undefined
}

export async function requireAuth(): Promise<AuthResult | NextResponse> {
  const { userId, sessionClaims } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const meta             = (sessionClaims?.metadata as Record<string, unknown>) ?? {}
  const tier             = (meta.tier as Tier) ?? TIERS.FREE
  const stripeCustomerId = (meta.stripeCustomerId as string) ?? undefined

  return { userId, tier, stripeCustomerId }
}

export function isAuthError(result: AuthResult | NextResponse): result is NextResponse {
  return result instanceof NextResponse
}
