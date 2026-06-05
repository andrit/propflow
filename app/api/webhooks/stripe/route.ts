import { NextResponse } from 'next/server'
import { clerkClient } from '@clerk/nextjs/server'
import { stripe, tierForPriceId } from '@/lib/stripe'
import { TIERS } from '@/lib/tiers'
import type Stripe from 'stripe'

export const runtime = 'nodejs'

async function syncTierToClerk(userId: string, tier: string, stripeCustomerId: string) {
  const client = await clerkClient()
  await client.users.updateUserMetadata(userId, {
    publicMetadata: { tier, stripeCustomerId },
  })
}

export async function POST(req: Request) {
  const body = await req.text()
  const sig  = req.headers.get('stripe-signature')

  if (!sig) return NextResponse.json({ error: 'Missing signature' }, { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId  = session.metadata?.userId
        if (!userId || session.mode !== 'subscription') break

        const subscriptionId = session.subscription as string
        const subscription   = await stripe.subscriptions.retrieve(subscriptionId)
        const priceId        = subscription.items.data[0]?.price.id
        const tier           = tierForPriceId(priceId)
        const customerId     = session.customer as string

        await syncTierToClerk(userId, tier, customerId)
        break
      }

      case 'customer.subscription.updated': {
        const sub    = event.data.object as Stripe.Subscription
        const userId = sub.metadata?.userId

        if (!userId) {
          // Try to look up userId from customer metadata
          const customer = await stripe.customers.retrieve(sub.customer as string)
          if (customer.deleted) break
          const uid = (customer as Stripe.Customer).metadata?.userId
          if (!uid) break

          const priceId = sub.items.data[0]?.price.id
          const tier    = sub.status === 'active' ? tierForPriceId(priceId) : TIERS.FREE
          await syncTierToClerk(uid, tier, sub.customer as string)
          break
        }

        const priceId = sub.items.data[0]?.price.id
        const tier    = sub.status === 'active' ? tierForPriceId(priceId) : TIERS.FREE
        await syncTierToClerk(userId, tier, sub.customer as string)
        break
      }

      case 'customer.subscription.deleted': {
        const sub      = event.data.object as Stripe.Subscription
        const customer = await stripe.customers.retrieve(sub.customer as string)
        if (customer.deleted) break

        const userId = (customer as Stripe.Customer).metadata?.userId
          ?? sub.metadata?.userId
        if (!userId) break

        await syncTierToClerk(userId, TIERS.FREE, sub.customer as string)
        break
      }

      case 'invoice.payment_failed': {
        // Subscription remains active until period end — Stripe handles retry logic.
        // No tier change here; let customer.subscription.deleted fire when actually cancelled.
        break
      }
    }
  } catch (err) {
    console.error('[stripe webhook] handler error', err)
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
