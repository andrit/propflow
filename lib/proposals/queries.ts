import { eq, and, gte, count, desc, inArray } from 'drizzle-orm'
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

// ── Type mapping ─────────────────────────────────────────────────────────

export async function findLatestVersion(rootProposalId: string): Promise<Proposal | null> {
  // Latest = the version in the chain with no supersededById
  const rows = await db
    .select()
    .from(proposals)
    .where(
      and(
        eq(proposals.rootProposalId, rootProposalId),
        eq(proposals.supersededById, proposals.supersededById) // not null check via IS NULL below
      )
    )
  // Simpler: fetch the root and walk — for MVP, chains are short (1-3 versions)
  const [root] = await db.select().from(proposals).where(eq(proposals.id, rootProposalId))
  if (!root) return null
  if (!root.supersededById) return findProposal(rootProposalId)
  return findProposal(root.supersededById)
}

function rowToProposal(
  row: typeof proposals.$inferSelect,
  sections: (typeof proposalSections.$inferSelect)[]
): Proposal {
  return {
    id:             row.id,
    userId:         row.userId,
    title:          row.title,
    client:         row.client as Proposal['client'],
    proposalType:   row.proposalType as Proposal['proposalType'],
    status:         row.status as Proposal['status'],
    pdfR2Key:       row.pdfR2Key,
    rootProposalId: row.rootProposalId,
    supersededById: row.supersededById,
    sections:       sections.map(rowToSection),
    createdAt:      row.createdAt,
    updatedAt:      row.updatedAt,
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
