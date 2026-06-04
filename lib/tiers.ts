export const TIERS = {
  FREE:  'free',
  PRO:   'pro',
  TEAMS: 'teams',
} as const

export type Tier = typeof TIERS[keyof typeof TIERS]

export const TIER_ORDER: Tier[] = [TIERS.FREE, TIERS.PRO, TIERS.TEAMS]

export function tierAtLeast(userTier: Tier, required: Tier): boolean {
  return TIER_ORDER.indexOf(userTier) >= TIER_ORDER.indexOf(required)
}

export const TIER_LABELS: Record<Tier, string> = {
  [TIERS.FREE]:  'Free',
  [TIERS.PRO]:   'Pro',
  [TIERS.TEAMS]: 'Teams',
}

// Free tier limits
export const FREE_PROPOSALS_PER_MONTH = 1
export const FREE_TEMPLATES_LIMIT = 0        // cannot create custom templates
export const PRO_TEMPLATES_LIMIT   = 5
export const TEAMS_SEATS           = 3
