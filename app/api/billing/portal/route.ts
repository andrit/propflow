import { NextResponse } from 'next/server'
import { requireAuth, isAuthError } from '@/lib/auth'
import { stripe } from '@/lib/stripe'

export async function POST() {
  const auth = await requireAuth()
  if (isAuthError(auth)) return auth

  const { stripeCustomerId } = auth
  if (!stripeCustomerId) {
    return NextResponse.json({ error: 'No billing account found' }, { status: 400 })
  }

  const session = await stripe.billingPortal.sessions.create({
    customer:   stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
  })

  return NextResponse.json({ url: session.url })
}
