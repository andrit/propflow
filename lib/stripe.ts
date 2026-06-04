import Stripe from 'stripe'
import { TIERS, type Tier } from './tiers'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export const STRIPE_PRICES = {
  pro_monthly:   process.env.STRIPE_PRO_MONTHLY_PRICE_ID!,
  pro_annual:    process.env.STRIPE_PRO_ANNUAL_PRICE_ID!,
  teams_monthly: process.env.STRIPE_TEAMS_MONTHLY_PRICE_ID!,
  teams_annual:  process.env.STRIPE_TEAMS_ANNUAL_PRICE_ID!,
} as const

export function tierForPriceId(priceId: string): Tier {
  if ([STRIPE_PRICES.pro_monthly, STRIPE_PRICES.pro_annual].includes(priceId as never))
    return TIERS.PRO
  if ([STRIPE_PRICES.teams_monthly, STRIPE_PRICES.teams_annual].includes(priceId as never))
    return TIERS.TEAMS
  return TIERS.FREE
}

export const PRICING = {
  [TIERS.PRO]: {
    monthly: 9,
    annual:  79,
    annualMonthly: 6.58,
  },
  [TIERS.TEAMS]: {
    monthly: 19,
    annual:  159,
    annualMonthly: 13.25,
  },
} as const
