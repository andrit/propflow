import { describe, it, expect } from 'vitest'
import {
  ClientSchema,
  CreateProposalSchema,
  UpdateSectionSchema,
  AddSectionSchema,
  LineItemSchema,
  DiscountSchema,
  PricingContentSchema,
  TermsContentSchema,
  ScopeContentSchema,
  DeliverablesContentSchema,
} from '../schemas'

// ── ClientSchema ─────────────────────────────────────────────────────────────

describe('ClientSchema', () => {
  it('accepts valid client', () => {
    const result = ClientSchema.safeParse({ name: 'Alice', email: 'alice@acme.com' })
    expect(result.success).toBe(true)
  })

  it('accepts client with optional company', () => {
    const result = ClientSchema.safeParse({ name: 'Bob', email: 'bob@co.com', company: 'Acme' })
    expect(result.success).toBe(true)
  })

  it('rejects missing name', () => {
    const result = ClientSchema.safeParse({ email: 'x@x.com' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid email', () => {
    const result = ClientSchema.safeParse({ name: 'Alice', email: 'not-an-email' })
    expect(result.success).toBe(false)
  })

  it('rejects empty name', () => {
    const result = ClientSchema.safeParse({ name: '', email: 'a@b.com' })
    expect(result.success).toBe(false)
  })
})

// ── CreateProposalSchema ─────────────────────────────────────────────────────

describe('CreateProposalSchema', () => {
  const base = {
    title:        'Website Redesign',
    client:       { name: 'Acme', email: 'acme@co.com' },
    proposalType: 'cold' as const,
    template:     'clean' as const,
    currency:     'USD',
  }

  it('accepts valid input', () => {
    expect(CreateProposalSchema.safeParse(base).success).toBe(true)
  })

  it('defaults proposalType to cold', () => {
    const { proposalType: _, ...rest } = base
    const result = CreateProposalSchema.safeParse(rest)
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.proposalType).toBe('cold')
  })

  it('defaults template to clean', () => {
    const { template: _, ...rest } = base
    const result = CreateProposalSchema.safeParse(rest)
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.template).toBe('clean')
  })

  it('defaults currency to USD', () => {
    const { currency: _, ...rest } = base
    const result = CreateProposalSchema.safeParse(rest)
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.currency).toBe('USD')
  })

  it('rejects title over 200 chars', () => {
    const result = CreateProposalSchema.safeParse({ ...base, title: 'x'.repeat(201) })
    expect(result.success).toBe(false)
  })

  it('rejects invalid proposalType', () => {
    const result = CreateProposalSchema.safeParse({ ...base, proposalType: 'unknown' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid template', () => {
    const result = CreateProposalSchema.safeParse({ ...base, template: 'fancy' })
    expect(result.success).toBe(false)
  })
})

// ── UpdateSectionSchema ──────────────────────────────────────────────────────

describe('UpdateSectionSchema', () => {
  it('accepts empty update (all optional)', () => {
    expect(UpdateSectionSchema.safeParse({}).success).toBe(true)
  })

  it('accepts partial update', () => {
    expect(UpdateSectionSchema.safeParse({ title: 'New Title' }).success).toBe(true)
  })

  it('accepts content update', () => {
    expect(UpdateSectionSchema.safeParse({ content: { text: 'hello' } }).success).toBe(true)
  })

  it('accepts complete flag', () => {
    expect(UpdateSectionSchema.safeParse({ complete: true }).success).toBe(true)
  })

  it('rejects empty title string', () => {
    expect(UpdateSectionSchema.safeParse({ title: '' }).success).toBe(false)
  })
})

// ── AddSectionSchema ─────────────────────────────────────────────────────────

describe('AddSectionSchema', () => {
  it('accepts valid section', () => {
    expect(AddSectionSchema.safeParse({ type: 'scope', title: 'Project Scope' }).success).toBe(true)
  })

  it('rejects invalid type', () => {
    expect(AddSectionSchema.safeParse({ type: 'invalid', title: 'x' }).success).toBe(false)
  })

  it('rejects empty title', () => {
    expect(AddSectionSchema.safeParse({ type: 'scope', title: '' }).success).toBe(false)
  })
})

// ── LineItemSchema ────────────────────────────────────────────────────────────

describe('LineItemSchema', () => {
  const item = { description: 'Design work', quantity: 10, unitRate: 150, total: 1500 }

  it('accepts valid line item', () => {
    expect(LineItemSchema.safeParse(item).success).toBe(true)
  })

  it('rejects zero quantity', () => {
    expect(LineItemSchema.safeParse({ ...item, quantity: 0 }).success).toBe(false)
  })

  it('rejects negative unit rate', () => {
    expect(LineItemSchema.safeParse({ ...item, unitRate: -10 }).success).toBe(false)
  })

  it('accepts zero unit rate (free item)', () => {
    expect(LineItemSchema.safeParse({ ...item, unitRate: 0, total: 0 }).success).toBe(true)
  })
})

// ── DiscountSchema ────────────────────────────────────────────────────────────

describe('DiscountSchema', () => {
  it('accepts valid discount', () => {
    expect(DiscountSchema.safeParse({ label: 'Early bird', amount: 500 }).success).toBe(true)
  })

  it('defaults label to Discount', () => {
    const result = DiscountSchema.safeParse({ amount: 100 })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.label).toBe('Discount')
  })

  it('rejects negative amount', () => {
    expect(DiscountSchema.safeParse({ amount: -100 }).success).toBe(false)
  })
})

// ── PricingContentSchema ─────────────────────────────────────────────────────

describe('PricingContentSchema', () => {
  it('accepts empty pricing', () => {
    expect(PricingContentSchema.safeParse({}).success).toBe(true)
  })

  it('accepts pricing with line items', () => {
    const result = PricingContentSchema.safeParse({
      lineItems: [{ description: 'Design', quantity: 1, unitRate: 1000, total: 1000 }],
    })
    expect(result.success).toBe(true)
  })

  it('accepts pricing with discount', () => {
    expect(PricingContentSchema.safeParse({
      lineItems: [],
      discount:  { label: 'Promo', amount: 200 },
    }).success).toBe(true)
  })

  it('accepts null discount', () => {
    expect(PricingContentSchema.safeParse({ discount: null }).success).toBe(true)
  })
})

// ── TermsContentSchema ────────────────────────────────────────────────────────

describe('TermsContentSchema', () => {
  it('accepts text', () => {
    expect(TermsContentSchema.safeParse({ text: 'Payment due within 30 days.' }).success).toBe(true)
  })

  it('accepts empty object', () => {
    expect(TermsContentSchema.safeParse({}).success).toBe(true)
  })
})

// ── ScopeContentSchema ────────────────────────────────────────────────────────

describe('ScopeContentSchema', () => {
  it('accepts description', () => {
    expect(ScopeContentSchema.safeParse({ description: 'Build a marketing site.' }).success).toBe(true)
  })

  it('accepts inclusions and exclusions arrays', () => {
    expect(ScopeContentSchema.safeParse({
      inclusions: ['5 pages', 'Mobile responsive'],
      exclusions: ['Copywriting'],
    }).success).toBe(true)
  })
})

// ── DeliverablesContentSchema ─────────────────────────────────────────────────

describe('DeliverablesContentSchema', () => {
  it('accepts deliverable items', () => {
    expect(DeliverablesContentSchema.safeParse({
      items: [{ title: 'Homepage', description: 'Main landing page' }],
    }).success).toBe(true)
  })

  it('accepts items without optional description', () => {
    expect(DeliverablesContentSchema.safeParse({
      items: [{ title: 'Wireframes' }],
    }).success).toBe(true)
  })

  it('accepts empty items array', () => {
    expect(DeliverablesContentSchema.safeParse({ items: [] }).success).toBe(true)
  })
})
