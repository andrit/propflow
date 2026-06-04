import { nanoid } from 'nanoid'
import { eq, and } from 'drizzle-orm'
import { db } from '../db'
import { proposals, proposalSections, proposalShares } from '../db/schema'
import { eventBus } from '../domain/events'
import { NotFoundError } from '../domain/errors'
import {
  assertOwnership,
  assertCanCreateProposal,
  assertCanFinalize,
  assertCanEdit,
} from '../domain/invariants'
import { findProposal, countProposalsThisMonth } from './queries'
import type { Tier } from '../tiers'
import type { CreateProposalInput, UpdateSectionInput, AddSectionInput, Proposal } from './schemas'

export async function createProposal(
  input: CreateProposalInput,
  userId: string,
  tier: Tier
): Promise<Proposal> {
  const count = await countProposalsThisMonth(userId)
  assertCanCreateProposal(tier, count)

  const id = nanoid()
  await db.insert(proposals).values({
    id,
    userId,
    title:        input.title,
    client:       input.client,
    proposalType: input.proposalType,
    template:     input.template,
    currency:     input.currency,
    status:       'draft',
  })

  // Safe: failure here means the proposal exists but has no sections — acceptable state
  await db.insert(proposalSections).values(
    defaultSections(id, input.client)
  )

  const proposal = await findProposal(id)
  return proposal!
}

export async function addSection(
  proposalId: string,
  input: AddSectionInput,
  userId: string
): Promise<Proposal> {
  const proposal = await findProposal(proposalId)
  if (!proposal) throw new NotFoundError('Proposal', proposalId)
  assertOwnership(proposal.userId, userId)
  assertCanEdit(proposal)

  const maxOrder = proposal.sections.reduce((m, s) => Math.max(m, s.orderIndex), -1)

  await db.transaction(async (tx) => {
    await tx.insert(proposalSections).values({
      id:         nanoid(),
      proposalId,
      type:       input.type,
      title:      input.title,
      content:    {},
      orderIndex: maxOrder + 1,
      complete:   false,
    })
    await tx.update(proposals)
      .set({ updatedAt: new Date() })
      .where(eq(proposals.id, proposalId))
  })

  return (await findProposal(proposalId))!
}

export async function updateSection(
  proposalId: string,
  sectionId: string,
  input: UpdateSectionInput,
  userId: string
): Promise<Proposal> {
  const proposal = await findProposal(proposalId)
  if (!proposal) throw new NotFoundError('Proposal', proposalId)
  assertOwnership(proposal.userId, userId)
  assertCanEdit(proposal)

  await db.transaction(async (tx) => {
    await tx.update(proposalSections)
      .set({
        ...(input.title    !== undefined && { title: input.title }),
        ...(input.content  !== undefined && { content: input.content }),
        ...(input.complete !== undefined && { complete: input.complete }),
        updatedAt: new Date(),
      })
      .where(and(eq(proposalSections.id, sectionId), eq(proposalSections.proposalId, proposalId)))
    await tx.update(proposals)
      .set({ updatedAt: new Date() })
      .where(eq(proposals.id, proposalId))
  })

  return (await findProposal(proposalId))!
}

export async function finalizeProposal(proposalId: string, userId: string): Promise<Proposal> {
  const proposal = await findProposal(proposalId)
  if (!proposal) throw new NotFoundError('Proposal', proposalId)
  assertOwnership(proposal.userId, userId)
  assertCanFinalize(proposal, proposal.sections)

  await db.update(proposals)
    .set({ status: 'finalized', updatedAt: new Date() })
    .where(eq(proposals.id, proposalId))

  // Publish AFTER the write commits — not inside the transaction
  await eventBus.publish({ type: 'proposal.finalized', payload: { proposalId, userId } })
  await eventBus.publish({ type: 'pdf.render.requested', payload: { proposalId, userId } })

  return (await findProposal(proposalId))!
}

export async function archiveProposal(proposalId: string, userId: string): Promise<Proposal> {
  const proposal = await findProposal(proposalId)
  if (!proposal) throw new NotFoundError('Proposal', proposalId)
  assertOwnership(proposal.userId, userId)

  await db.update(proposals)
    .set({ status: 'archived', updatedAt: new Date() })
    .where(eq(proposals.id, proposalId))

  return (await findProposal(proposalId))!
}

// Creates a draft clone of a finalized proposal. Marks the original as superseded
// when the revision is itself finalized — not at creation time (user may abandon the revision).
export async function createRevision(proposalId: string, userId: string): Promise<Proposal> {
  const original = await findProposal(proposalId)
  if (!original) throw new NotFoundError('Proposal', proposalId)
  assertOwnership(original.userId, userId)

  if (original.status !== 'finalized') {
    throw new Error('Only finalized proposals can have a revision created')
  }

  const newId = nanoid()
  // Root is either the original's root (if it's already a revision) or the original itself
  const rootId = original.rootProposalId ?? original.id

  await db.transaction(async (tx) => {
    await tx.insert(proposals).values({
      id:             newId,
      userId,
      title:          original.title,
      client:         original.client as Record<string, unknown>,
      proposalType:   original.proposalType,
      status:         'draft',
      rootProposalId: rootId,
      supersededById: null,
    })
    // Deep-copy sections
    if (original.sections.length > 0) {
      await tx.insert(proposalSections).values(
        original.sections.map(s => ({
          id:         nanoid(),
          proposalId: newId,
          type:       s.type,
          title:      s.title,
          content:    s.content as Record<string, unknown>,
          orderIndex: s.orderIndex,
          complete:   s.complete,
        }))
      )
    }
    // Mark original as superseded
    await tx.update(proposals)
      .set({ supersededById: newId, updatedAt: new Date() })
      .where(eq(proposals.id, proposalId))
  })

  return (await findProposal(newId))!
}

export async function shareProposal(proposalId: string, userId: string): Promise<string> {
  const proposal = await findProposal(proposalId)
  if (!proposal) throw new NotFoundError('Proposal', proposalId)
  assertOwnership(proposal.userId, userId)

  if (proposal.status !== 'finalized') {
    throw new NotFoundError('Proposal must be finalized before sharing', proposalId)
  }

  const token = nanoid(32)
  await db.insert(proposalShares).values({
    id:         nanoid(),
    proposalId,
    token,
  })

  await eventBus.publish({ type: 'proposal.shared', payload: { proposalId, shareToken: token } })
  return token
}

// ── Helpers ────────────────────────────────────────────────────────────────

const DEFAULT_TERMS = `**Payment.** A 50% deposit is due upon proposal acceptance. The remaining balance is due upon delivery of final work. All payments are due within 7 days of invoice.

**Revisions.** Each deliverable includes two rounds of revisions. Additional revisions are billed at the hourly rate agreed upon. Revisions do not include changes to the agreed scope.

**Intellectual Property.** Full ownership transfers upon receipt of final payment. I retain the right to display this work in my portfolio.

**Cancellation.** If the project is cancelled after work begins, I retain the deposit and deliver work completed to date.`

function defaultSections(proposalId: string, client: { name: string; company?: string; email: string }) {
  return [
    {
      id: nanoid(), proposalId, type: 'client-info', title: 'Client Information', orderIndex: 0, complete: false,
      content: { name: client.name, company: client.company ?? '', email: client.email },
    },
    {
      id: nanoid(), proposalId, type: 'scope', title: 'Scope of Work', orderIndex: 1, complete: false,
      content: {},
    },
    {
      id: nanoid(), proposalId, type: 'deliverables', title: 'Deliverables', orderIndex: 2, complete: false,
      content: { items: [] },
    },
    {
      id: nanoid(), proposalId, type: 'pricing', title: 'Investment', orderIndex: 3, complete: false,
      content: { lineItems: [] },
    },
    {
      id: nanoid(), proposalId, type: 'terms', title: 'Terms & Conditions', orderIndex: 4, complete: false,
      content: { text: DEFAULT_TERMS },
    },
  ]
}
