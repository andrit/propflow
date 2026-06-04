import { pgTable, text, boolean, integer, jsonb, timestamp, index, unique } from 'drizzle-orm/pg-core'

// ── Proposal Authoring context ─────────────────────────────────────────────

export const proposals = pgTable('proposals', {
  id:              text('id').primaryKey(),
  userId:          text('user_id').notNull(),
  title:           text('title').notNull(),
  client:          jsonb('client').notNull().default({}),    // ClientSchema value object
  proposalType:    text('proposal_type').notNull().default('cold'), // 'cold' | 'warm' | 'retainer'
  status:          text('status').notNull().default('draft'), // 'draft' | 'finalized' | 'archived'
  pdfR2Key:        text('pdf_r2_key'),                        // set after PDF is generated
  // Versioning — null on the original; set on all revisions
  rootProposalId:  text('root_proposal_id'),                  // FK self — anchor for the whole chain
  supersededById:  text('superseded_by_id'),                  // FK self — next version in chain
  createdAt:       timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:       timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const proposalSections = pgTable('proposal_sections', {
  id:          text('id').primaryKey(),
  proposalId:  text('proposal_id').notNull().references(() => proposals.id, { onDelete: 'cascade' }),
  type:        text('type').notNull(), // 'client-info' | 'scope' | 'deliverables' | 'pricing' | 'terms' | 'custom'
  title:       text('title').notNull(),
  content:     jsonb('content').notNull().default({}), // SectionContent value object (JSONB per type)
  orderIndex:  integer('order_index').notNull().default(0),
  complete:    boolean('complete').notNull().default(false),
  createdAt:   timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:   timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index('proposal_sections_proposal_id_idx').on(t.proposalId),
])

export const proposalShares = pgTable('proposal_shares', {
  id:         text('id').primaryKey(),
  proposalId: text('proposal_id').notNull().references(() => proposals.id, { onDelete: 'cascade' }),
  token:      text('token').notNull(),
  createdAt:  timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  unique('proposal_shares_token_unique').on(t.token),
  index('proposal_shares_token_idx').on(t.token),
])

// ── Template Library context ───────────────────────────────────────────────

export const templates = pgTable('templates', {
  id:          text('id').primaryKey(),
  userId:      text('user_id'),             // NULL for built-in templates
  name:        text('name').notNull(),
  description: text('description'),
  isBuiltin:   boolean('is_builtin').notNull().default(false),
  createdAt:   timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:   timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const templateSections = pgTable('template_sections', {
  id:         text('id').primaryKey(),
  templateId: text('template_id').notNull().references(() => templates.id, { onDelete: 'cascade' }),
  type:       text('type').notNull(),
  title:      text('title').notNull(),
  content:    jsonb('content').notNull().default({}),
  orderIndex: integer('order_index').notNull().default(0),
}, (t) => [
  index('template_sections_template_id_idx').on(t.templateId),
])

// ── Brand & Account context ────────────────────────────────────────────────

export const brands = pgTable('brands', {
  id:           text('id').primaryKey(),
  userId:       text('user_id').notNull(),
  logoR2Key:    text('logo_r2_key'),
  primaryColor: text('primary_color').notNull().default('#7c3aed'),
  accentColor:  text('accent_color').notNull().default('#a78bfa'),
  font:         text('font').notNull().default('inter'),
  createdAt:    timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:    timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  unique('brands_user_id_unique').on(t.userId),
])

// ── Infrastructure ─────────────────────────────────────────────────────────

// Idempotency guard for domain event side effects (PDF render, email, etc.)
export const processedEvents = pgTable('processed_events', {
  eventId:     text('event_id').primaryKey(),
  eventType:   text('event_type').notNull(),
  processedAt: timestamp('processed_at', { withTimezone: true }).notNull().defaultNow(),
})
