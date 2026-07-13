import { z } from 'zod'

// ── Value objects ──────────────────────────────────────────────────────────

export const ClientSchema = z.object({
  name:    z.string().min(1, 'Client name is required'),
  company: z.string().optional(),
  email:   z.string().email('Invalid email'),
})

export const LineItemSchema = z.object({
  description: z.string().min(1),
  quantity:    z.number().positive(),
  unitRate:    z.number().nonnegative(),
  total:       z.number().nonnegative(), // quantity * unitRate, stored for display
})

// ── Section content schemas (one per type) ─────────────────────────────────

export const ClientInfoContentSchema = z.object({
  name:         z.string().optional(),
  company:      z.string().optional(),
  email:        z.string().optional(),
  phone:        z.string().optional(),
  projectStart: z.string().optional(),
  notes:        z.string().optional(),
})

export const ScopeContentSchema = z.object({
  description: z.string().optional(),
  inclusions:  z.array(z.string()).optional(),
  exclusions:  z.array(z.string()).optional(),
})

export const DeliverablesContentSchema = z.object({
  items: z.array(z.object({
    title:       z.string(),
    description: z.string().optional(),
    dueDate:     z.string().optional(), // ISO date string
  })).optional(),
})

export const DiscountSchema = z.object({
  label:  z.string().default('Discount'),
  amount: z.number().nonnegative(),
})

export const PricingContentSchema = z.object({
  lineItems:  z.array(LineItemSchema).optional(),
  discount:   DiscountSchema.nullable().optional(),
  subtotal:   z.number().nonnegative().optional(),
  taxRate:    z.number().nonnegative().optional(),
  taxAmount:  z.number().nonnegative().optional(),
  total:      z.number().nonnegative().optional(),
  depositPct: z.number().min(0).max(100).optional(),
})

export const TermsContentSchema = z.object({
  text: z.string().optional(),
})

export const CustomContentSchema = z.object({
  text: z.string().optional(),
})

export const SectionContentSchema = z.discriminatedUnion('__type', [
  ClientInfoContentSchema.extend({ __type: z.literal('client-info') }),
  ScopeContentSchema.extend({ __type: z.literal('scope') }),
  DeliverablesContentSchema.extend({ __type: z.literal('deliverables') }),
  PricingContentSchema.extend({ __type: z.literal('pricing') }),
  TermsContentSchema.extend({ __type: z.literal('terms') }),
  CustomContentSchema.extend({ __type: z.literal('custom') }),
])

// ── Section entity ─────────────────────────────────────────────────────────

export const SECTION_TYPES = ['client-info', 'scope', 'deliverables', 'pricing', 'terms', 'custom'] as const
export type SectionType = typeof SECTION_TYPES[number]

export const REQUIRED_SECTION_TYPES: SectionType[] = ['client-info', 'scope', 'pricing']

export const SectionSchema = z.object({
  id:         z.string(),
  proposalId: z.string(),
  type:       z.enum(SECTION_TYPES),
  title:      z.string().min(1),
  content:    z.record(z.unknown()).default({}),
  orderIndex: z.number().int().nonnegative(),
  complete:   z.boolean().default(false),
  createdAt:  z.date(),
  updatedAt:  z.date(),
})

// ── Proposal aggregate root ────────────────────────────────────────────────

export const PROPOSAL_STATUSES = ['draft', 'finalized', 'archived'] as const
export type ProposalStatus = typeof PROPOSAL_STATUSES[number]

export const PROPOSAL_TYPES = ['cold', 'warm', 'retainer'] as const
export type ProposalType = typeof PROPOSAL_TYPES[number]

export const TEMPLATE_TYPES = ['clean', 'executive', 'studio'] as const
export type TemplateType = typeof TEMPLATE_TYPES[number]

export const INDUSTRY_TYPES = ['tech', 'creative', 'trades', 'professional', 'events', 'marketing'] as const
export type IndustryType = typeof INDUSTRY_TYPES[number]

export const ProposalSchema = z.object({
  id:                              z.string(),
  userId:                          z.string(),
  title:                           z.string().min(1, 'Title is required'),
  client:                          ClientSchema,
  proposalType:                    z.enum(PROPOSAL_TYPES),
  status:                          z.enum(PROPOSAL_STATUSES),
  template:                        z.enum(TEMPLATE_TYPES).default('clean'),
  industry:                        z.enum(INDUSTRY_TYPES).default('tech'),
  currency:                        z.string().default('USD'),
  expiryAt:                        z.date().nullable(),
  coverQuoteOverride:              z.string().nullable(),
  coverQuoteAttributionOverride:   z.string().nullable(),
  pdfR2Key:                        z.string().nullable(),
  rootProposalId:                  z.string().nullable(),
  supersededById:                  z.string().nullable(),
  sections:                        z.array(SectionSchema).default([]),
  createdAt:                       z.date(),
  updatedAt:                       z.date(),
})

export type Client   = z.infer<typeof ClientSchema>
export type Section  = z.infer<typeof SectionSchema>
export type Proposal = z.infer<typeof ProposalSchema>
export type LineItem = z.infer<typeof LineItemSchema>

// ── Input schemas (for API route validation) ───────────────────────────────

export const CreateProposalSchema = z.object({
  title:        z.string().min(1).max(200),
  client:       ClientSchema,
  proposalType: z.enum(PROPOSAL_TYPES).default('cold'),
  template:     z.enum(TEMPLATE_TYPES).default('clean'),
  industry:     z.enum(INDUSTRY_TYPES).default('tech'),
  currency:     z.string().max(10).default('USD'),
})

export const UpdateSectionSchema = z.object({
  title:    z.string().min(1).max(200).optional(),
  content:  z.record(z.unknown()).optional(),
  complete: z.boolean().optional(),
})

export const AddSectionSchema = z.object({
  type:  z.enum(SECTION_TYPES),
  title: z.string().min(1).max(200),
})

export type CreateProposalInput  = z.infer<typeof CreateProposalSchema>
export type Discount             = z.infer<typeof DiscountSchema>
export type UpdateSectionInput  = z.infer<typeof UpdateSectionSchema>
export type AddSectionInput     = z.infer<typeof AddSectionSchema>
