import { describe, it, expect } from 'vitest'
import {
  assertOwnership,
  assertCanCreateProposal,
  assertCanFinalize,
  assertCanEdit,
  assertCanApplyCustomBrand,
  assertCanCreateTemplate,
} from '../invariants'
import { DomainError, ForbiddenError } from '../errors'
import { TIERS } from '../../tiers'
import type { Proposal, Section } from '../../proposals/schemas'

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeProposal(overrides: Partial<Proposal> = {}): Proposal {
  const now = new Date()
  return {
    id:                            'p1',
    userId:                        'u1',
    title:                         'Test Proposal',
    client:                        { name: 'Alice', email: 'alice@example.com' },
    proposalType:                  'cold',
    status:                        'draft',
    template:                      'clean',
    industry:                      'tech',
    currency:                      'USD',
    expiryAt:                      null,
    coverQuoteOverride:            null,
    coverQuoteAttributionOverride: null,
    pdfR2Key:                      null,
    rootProposalId:                null,
    supersededById:                null,
    sections:                      [],
    createdAt:                     now,
    updatedAt:                     now,
    ...overrides,
  }
}

function makeSection(overrides: Partial<Section> = {}): Section {
  const now = new Date()
  return {
    id:         's1',
    proposalId: 'p1',
    type:       'scope',
    title:      'Scope',
    content:    {},
    orderIndex: 0,
    complete:   true,
    createdAt:  now,
    updatedAt:  now,
    ...overrides,
  }
}

// ── assertOwnership ───────────────────────────────────────────────────────────

describe('assertOwnership', () => {
  it('does not throw when owner matches', () => {
    expect(() => assertOwnership('u1', 'u1')).not.toThrow()
  })

  it('throws ForbiddenError when owner does not match', () => {
    expect(() => assertOwnership('u1', 'u2')).toThrow(ForbiddenError)
  })
})

// ── assertCanCreateProposal ──────────────────────────────────────────────────

describe('assertCanCreateProposal', () => {
  it('free tier: allows first proposal', () => {
    expect(() => assertCanCreateProposal(TIERS.FREE, 0)).not.toThrow()
  })

  it('free tier: blocks second proposal', () => {
    expect(() => assertCanCreateProposal(TIERS.FREE, 1)).toThrow(DomainError)
  })

  it('pro tier: allows any count', () => {
    expect(() => assertCanCreateProposal(TIERS.PRO, 100)).not.toThrow()
  })

  it('teams tier: allows any count', () => {
    expect(() => assertCanCreateProposal(TIERS.TEAMS, 100)).not.toThrow()
  })
})

// ── assertCanFinalize ────────────────────────────────────────────────────────

describe('assertCanFinalize', () => {
  const requiredSections: Section[] = [
    makeSection({ id: 's1', type: 'client-info', complete: true }),
    makeSection({ id: 's2', type: 'scope',       complete: true }),
    makeSection({ id: 's3', type: 'pricing',     complete: true }),
  ]

  it('allows finalization when all required sections complete', () => {
    expect(() => assertCanFinalize(makeProposal(), requiredSections)).not.toThrow()
  })

  it('blocks finalization when a required section is incomplete', () => {
    const incomplete = [
      makeSection({ id: 's1', type: 'client-info', complete: true }),
      makeSection({ id: 's2', type: 'scope',       complete: false }),
      makeSection({ id: 's3', type: 'pricing',     complete: true }),
    ]
    expect(() => assertCanFinalize(makeProposal(), incomplete)).toThrow(DomainError)
  })

  it('blocks finalization when a required section is missing entirely', () => {
    const twoSections = [
      makeSection({ id: 's1', type: 'client-info', complete: true }),
      makeSection({ id: 's2', type: 'scope',       complete: true }),
    ]
    expect(() => assertCanFinalize(makeProposal(), twoSections)).toThrow(DomainError)
  })

  it('blocks finalization of a non-draft proposal', () => {
    const finalized = makeProposal({ status: 'finalized' })
    expect(() => assertCanFinalize(finalized, requiredSections)).toThrow(DomainError)
  })
})

// ── assertCanEdit ────────────────────────────────────────────────────────────

describe('assertCanEdit', () => {
  it('allows editing a draft', () => {
    expect(() => assertCanEdit(makeProposal({ status: 'draft' }))).not.toThrow()
  })

  it('blocks editing a finalized proposal', () => {
    expect(() => assertCanEdit(makeProposal({ status: 'finalized' }))).toThrow(DomainError)
  })

  it('blocks editing an archived proposal', () => {
    expect(() => assertCanEdit(makeProposal({ status: 'archived' }))).toThrow(DomainError)
  })
})

// ── assertCanApplyCustomBrand ────────────────────────────────────────────────

describe('assertCanApplyCustomBrand', () => {
  it('allows custom brand on pro', () => {
    expect(() => assertCanApplyCustomBrand(TIERS.PRO)).not.toThrow()
  })

  it('allows custom brand on teams', () => {
    expect(() => assertCanApplyCustomBrand(TIERS.TEAMS)).not.toThrow()
  })

  it('blocks custom brand on free', () => {
    expect(() => assertCanApplyCustomBrand(TIERS.FREE)).toThrow(DomainError)
  })
})

// ── assertCanCreateTemplate ──────────────────────────────────────────────────

describe('assertCanCreateTemplate', () => {
  it('allows pro with 0 templates', () => {
    expect(() => assertCanCreateTemplate(TIERS.PRO, 0)).not.toThrow()
  })

  it('allows pro with 4 templates (under limit)', () => {
    expect(() => assertCanCreateTemplate(TIERS.PRO, 4)).not.toThrow()
  })

  it('blocks pro at template limit (5)', () => {
    expect(() => assertCanCreateTemplate(TIERS.PRO, 5)).toThrow(DomainError)
  })

  it('allows teams with 5 templates (no limit)', () => {
    expect(() => assertCanCreateTemplate(TIERS.TEAMS, 5)).not.toThrow()
  })

  it('blocks free tier entirely', () => {
    expect(() => assertCanCreateTemplate(TIERS.FREE, 0)).toThrow(DomainError)
  })
})
