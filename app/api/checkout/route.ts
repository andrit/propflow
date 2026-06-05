import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { stripe, STRIPE_PRICES } from '@/lib/stripe'
import { z } from 'zod'

const BodySchema = z.object({
  plan:   z.enum(['pro', 'teams']),
  period: z.enum(['monthly', 'annual']).default('monthly'),
})

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const parsed = BodySchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })

  const { plan, period } = parsed.data
  const priceId =
    plan === 'pro'
      ? period === 'annual' ? STRIPE_PRICES.pro_annual    : STRIPE_PRICES.pro_monthly
      : period === 'annual' ? STRIPE_PRICES.teams_annual  : STRIPE_PRICES.teams_monthly

  // Create or retrieve Stripe customer so userId is attached to the customer object.
  // This lets subscription.updated/deleted webhooks resolve userId from customer.metadata.
  const existingList = await stripe.customers.search({
    query: `metadata['userId']:'${userId}'`,
    limit: 1,
  })
  const customer = existingList.data[0] ?? await stripe.customers.create({
    metadata: { userId },
  })

  const session = await stripe.checkout.sessions.create({
    mode:                 'subscription',
    payment_method_types: ['card'],
    customer:             customer.id,
    line_items:           [{ price: priceId, quantity: 1 }],
    success_url:          `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgrade=success`,
    cancel_url:           `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    metadata:             { userId },
    client_reference_id:  userId,
  })

  return NextResponse.json({ url: session.url })
}
