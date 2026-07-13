import { eq, and, or, gte, count, desc, inArray, isNull } from 'drizzle-orm'
import { db } from '../db'
import { proposals, proposalSections, proposalShares } from '../db/schema'
import type { Proposal, Section } from './schemas'

export async function findProposal(id: string): Promise<Proposal | null> {
  const [row] = await db.select().from(proposals).where(eq(proposals.id, id))
  if (!row) return null

  const sections = await db
    .select()
    .from(proposalSections)
    .where(eq(proposalSections.proposalId, id))
    .orderBy(proposalSections.orderIndex)

  return rowToProposal(row, sections)
}

export async function listProposals(userId: string): Promise<Proposal[]> {
  const rows = await db
    .select()
    .from(proposals)
    .where(eq(proposals.userId, userId))
    .orderBy(desc(proposals.updatedAt))

  // Load sections for all proposals in one query
  if (rows.length === 0) return []
  const proposalIds = rows.map(r => r.id)
  const allSections = await db
    .select()
    .from(proposalSections)
    .where(inArray(proposalSections.proposalId, proposalIds))
    .orderBy(proposalSections.orderIndex)

  return rows.map(row => rowToProposal(row, allSections.filter(s => s.proposalId === row.id)))
}

export async function countProposalsThisMonth(userId: string): Promise<number> {
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const [result] = await db
    .select({ value: count() })
    .from(proposals)
    .where(and(
      eq(proposals.userId, userId),
      gte(proposals.createdAt, startOfMonth)
    ))

  return result?.value ?? 0
}

export async function findShareByToken(token: string) {
  const [row] = await db
    .select()
    .from(proposalShares)
    .where(eq(proposalShares.token, token))
  return row ?? null
}

export async function findShareByProposal(proposalId: string) {
  const [row] = await db
    .select()
    .from(proposalShares)
    .where(eq(proposalShares.proposalId, proposalId))
    .orderBy(desc(proposalShares.createdAt))
    .limit(1)
  return row ?? null
}

// ── Type mapping ─────────────────────────────────────────────────────────

// Find the current (unsuperseded) version in a proposal chain.
// anyId can be the original proposal ID or any revision's ID.
export async function findLatestVersion(anyId: string): Promise<Proposal | null> {
  const [row] = await db
    .select({ id: proposals.id, rootProposalId: proposals.rootProposalId })
    .from(proposals)
    .where(eq(proposals.id, anyId))
  if (!row) return null

  const rootId = row.rootProposalId ?? row.id

  // The latest version is the one with no successor in this chain
  const [latest] = await db
    .select({ id: proposals.id })
    .from(proposals)
    .where(and(
      or(eq(proposals.id, rootId), eq(proposals.rootProposalId, rootId)),
      isNull(proposals.supersededById)
    ))
    .limit(1)

  if (!latest) return null
  return findProposal(latest.id)
}

function rowToProposal(
  row: typeof proposals.$inferSelect,
  sections: (typeof proposalSections.$inferSelect)[]
): Proposal {
  return {
    id:                             row.id,
    userId:                         row.userId,
    title:                          row.title,
    client:                         row.client as Proposal['client'],
    proposalType:                   row.proposalType as Proposal['proposalType'],
    status:                         row.status as Proposal['status'],
    template:                       (row.template ?? 'clean') as Proposal['template'],
    industry:                       (row.industry ?? 'tech') as Proposal['industry'],
    currency:                       row.currency ?? 'USD',
    expiryAt:                       row.expiryAt ?? null,
    coverQuoteOverride:             row.coverQuoteOverride ?? null,
    coverQuoteAttributionOverride:  row.coverQuoteAttributionOverride ?? null,
    pdfR2Key:                       row.pdfR2Key ?? null,
    rootProposalId:                 row.rootProposalId ?? null,
    supersededById:                 row.supersededById ?? null,
    sections:                       sections.map(rowToSection),
    createdAt:                      row.createdAt,
    updatedAt:                      row.updatedAt,
  }
}

function rowToSection(row: typeof proposalSections.$inferSelect): Section {
  return {
    id:         row.id,
    proposalId: row.proposalId,
    type:       row.type as Section['type'],
    title:      row.title,
    content:    (row.content as Record<string, unknown>) ?? {},
    orderIndex: row.orderIndex,
    complete:   row.complete,
    createdAt:  row.createdAt,
    updatedAt:  row.updatedAt,
  }
}
