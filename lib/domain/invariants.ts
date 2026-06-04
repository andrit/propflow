import { DomainError, ForbiddenError } from './errors'
import { tierAtLeast, TIERS, FREE_PROPOSALS_PER_MONTH, PRO_TEMPLATES_LIMIT, type Tier } from '../tiers'
import type { Proposal, Section } from '../proposals/schemas'
import { REQUIRED_SECTION_TYPES } from '../proposals/schemas'

export function assertOwnership(ownerId: string, requestUserId: string): void {
  if (ownerId !== requestUserId) throw new ForbiddenError()
}

export function assertCanCreateProposal(tier: Tier, countThisMonth: number): void {
  if (tier === TIERS.FREE && countThisMonth >= FREE_PROPOSALS_PER_MONTH) {
    throw new DomainError(
      `Free plan allows ${FREE_PROPOSALS_PER_MONTH} proposal per month. Upgrade to Pro for unlimited proposals.`
    )
  }
}

export function assertCanFinalize(proposal: Proposal, sections: Section[]): void {
  if (proposal.status !== 'draft') {
    throw new DomainError('Only draft proposals can be finalized')
  }

  const missing = REQUIRED_SECTION_TYPES.filter(type =>
    !sections.find(s => s.type === type && s.complete)
  )

  if (missing.length > 0) {
    throw new DomainError(
      `Cannot finalize: complete these sections first — ${missing.join(', ')}`
    )
  }
}

export function assertCanEdit(proposal: Proposal): void {
  if (proposal.status === 'finalized') {
    throw new DomainError('Finalized proposals cannot be edited. Archive and create a new one.')
  }
  if (proposal.status === 'archived') {
    throw new DomainError('Archived proposals cannot be edited.')
  }
}

export function assertCanApplyCustomBrand(tier: Tier): void {
  if (!tierAtLeast(tier, TIERS.PRO)) {
    throw new DomainError('Custom branding requires a Pro or Teams plan.')
  }
}

export function assertCanCreateTemplate(tier: Tier, existingCount: number): void {
  if (!tierAtLeast(tier, TIERS.PRO)) {
    throw new DomainError('Saving custom templates requires a Pro or Teams plan.')
  }
  if (tier === TIERS.PRO && existingCount >= PRO_TEMPLATES_LIMIT) {
    throw new DomainError(`Pro plan allows up to ${PRO_TEMPLATES_LIMIT} saved templates.`)
  }
}
