import { describe, it, expect } from 'vitest'
import {
  TIERS,
  TIER_ORDER,
  TIER_LABELS,
  tierAtLeast,
  FREE_PROPOSALS_PER_MONTH,
  FREE_TEMPLATES_LIMIT,
  PRO_TEMPLATES_LIMIT,
  TEAMS_SEATS,
} from '../tiers'

describe('tierAtLeast', () => {
  it('free >= free', () => expect(tierAtLeast(TIERS.FREE,  TIERS.FREE)).toBe(true))
  it('pro >= free',  () => expect(tierAtLeast(TIERS.PRO,   TIERS.FREE)).toBe(true))
  it('pro >= pro',   () => expect(tierAtLeast(TIERS.PRO,   TIERS.PRO)).toBe(true))
  it('teams >= pro', () => expect(tierAtLeast(TIERS.TEAMS, TIERS.PRO)).toBe(true))
  it('teams >= teams', () => expect(tierAtLeast(TIERS.TEAMS, TIERS.TEAMS)).toBe(true))

  it('free < pro',   () => expect(tierAtLeast(TIERS.FREE,  TIERS.PRO)).toBe(false))
  it('free < teams', () => expect(tierAtLeast(TIERS.FREE,  TIERS.TEAMS)).toBe(false))
  it('pro < teams',  () => expect(tierAtLeast(TIERS.PRO,   TIERS.TEAMS)).toBe(false))
})

describe('TIER_ORDER', () => {
  it('is [free, pro, teams]', () => {
    expect(TIER_ORDER).toEqual([TIERS.FREE, TIERS.PRO, TIERS.TEAMS])
  })
})

describe('TIER_LABELS', () => {
  it('has labels for all tiers', () => {
    expect(TIER_LABELS[TIERS.FREE]).toBe('Free')
    expect(TIER_LABELS[TIERS.PRO]).toBe('Pro')
    expect(TIER_LABELS[TIERS.TEAMS]).toBe('Teams')
  })
})

describe('tier constants', () => {
  it('free allows 1 proposal per month', () => {
    expect(FREE_PROPOSALS_PER_MONTH).toBe(1)
  })

  it('free allows 0 custom templates', () => {
    expect(FREE_TEMPLATES_LIMIT).toBe(0)
  })

  it('pro allows 5 saved templates', () => {
    expect(PRO_TEMPLATES_LIMIT).toBe(5)
  })

  it('teams has 3 seats', () => {
    expect(TEAMS_SEATS).toBe(3)
  })
})
