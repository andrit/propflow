import { nanoid } from 'nanoid'
import { eq, or, isNull } from 'drizzle-orm'
import { db } from '../db'
import { templates, templateSections, proposals, proposalSections } from '../db/schema'
import { NotFoundError } from '../domain/errors'
import { assertCanCreateTemplate } from '../domain/invariants'
import type { Tier } from '../tiers'
import type { CreateTemplateInput, Template } from './schemas'
import type { Proposal } from '../proposals/schemas'

export async function listTemplates(userId: string): Promise<Template[]> {
  const rows = await db
    .select()
    .from(templates)
    .where(or(isNull(templates.userId), eq(templates.userId, userId)))

  if (rows.length === 0) return []

  const allSections = await db
    .select()
    .from(templateSections)
    .orderBy(templateSections.orderIndex)

  return rows.map(row => ({
    id:          row.id,
    userId:      row.userId,
    name:        row.name,
    description: row.description,
    isBuiltin:   row.isBuiltin,
    createdAt:   row.createdAt,
    updatedAt:   row.updatedAt,
    sections:    allSections
      .filter(s => s.templateId === row.id)
      .map(s => ({
        id:         s.id,
        templateId: s.templateId,
        type:       s.type as Template['sections'][number]['type'],
        title:      s.title,
        content:    (s.content as Record<string, unknown>) ?? {},
        orderIndex: s.orderIndex,
      })),
  }))
}

export async function createTemplate(
  input: CreateTemplateInput,
  userId: string,
  tier: Tier
): Promise<Template> {
  const existing = await db
    .select()
    .from(templates)
    .where(eq(templates.userId, userId))
  assertCanCreateTemplate(tier, existing.length)

  const id = nanoid()
  await db.transaction(async (tx) => {
    await tx.insert(templates).values({
      id,
      userId,
      name:        input.name,
      description: input.description ?? null,
      isBuiltin:   false,
    })
    await tx.insert(templateSections).values(
      input.sections.map((s, i) => ({
        id:         nanoid(),
        templateId: id,
        type:       s.type,
        title:      s.title,
        content:    s.content ?? {},
        orderIndex: i,
      }))
    )
  })

  const [result] = await listTemplates(userId)
  return result
}

// Applying a template creates a NEW Proposal — the Template is never mutated
export async function applyTemplate(
  templateId: string,
  userId: string,
  tier: Tier
): Promise<Proposal> {
  const allTemplates = await listTemplates(userId)
  const template = allTemplates.find(t => t.id === templateId)
  if (!template) throw new NotFoundError('Template', templateId)

  // Import here to avoid circular deps — proposals service owns Proposal creation
  const { createProposal, addSection, updateSection } = await import('../proposals/service')

  const proposal = await createProposal(
    { title: `Proposal (from ${template.name})`, client: { name: '', email: '' }, proposalType: 'cold' },
    userId,
    tier
  )

  // Replace default sections with template sections
  // Phase 3: implement section replace — for now, add template sections as custom sections
  await Promise.all(template.sections.map(async (ts) => {
    const updated = await addSection(proposal.id, { type: ts.type, title: ts.title }, userId)
    if (Object.keys(ts.content).length > 0) {
      await updateSection(proposal.id, updated.sections.at(-1)!.id, { content: ts.content }, userId)
    }
  }))

  return proposal
}
