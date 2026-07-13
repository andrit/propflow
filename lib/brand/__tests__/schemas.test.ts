import { describe, it, expect } from 'vitest'
import { SaveBrandSchema, BrandSchema } from '../schemas'

describe('SaveBrandSchema', () => {
  it('accepts valid brand settings', () => {
    const result = SaveBrandSchema.safeParse({
      primaryColor: '#4f46e5',
      accentColor:  '#818cf8',
      font:         'inter',
    })
    expect(result.success).toBe(true)
  })

  it('accepts all font options', () => {
    for (const font of ['inter', 'merriweather', 'playfair'] as const) {
      expect(SaveBrandSchema.safeParse({ font }).success).toBe(true)
    }
  })

  it('rejects invalid font', () => {
    expect(SaveBrandSchema.safeParse({ font: 'comic-sans' }).success).toBe(false)
  })

  it('accepts cover quote', () => {
    expect(SaveBrandSchema.safeParse({
      coverQuote:            'Do great work.',
      coverQuoteAttribution: 'Someone wise',
    }).success).toBe(true)
  })

  it('rejects cover quote over 400 chars', () => {
    expect(SaveBrandSchema.safeParse({
      coverQuote: 'x'.repeat(401),
    }).success).toBe(false)
  })

  it('rejects attribution over 100 chars', () => {
    expect(SaveBrandSchema.safeParse({
      coverQuoteAttribution: 'x'.repeat(101),
    }).success).toBe(false)
  })

  it('accepts null cover quote (clear it)', () => {
    expect(SaveBrandSchema.safeParse({ coverQuote: null }).success).toBe(true)
  })

  it('accepts empty object (all fields optional)', () => {
    expect(SaveBrandSchema.safeParse({}).success).toBe(true)
  })
})

describe('BrandSchema', () => {
  it('has required fields', () => {
    const result = BrandSchema.safeParse({
      id:                    'b1',
      userId:                'u1',
      logoR2Key:             null,
      primaryColor:          '#4f46e5',
      accentColor:           '#818cf8',
      font:                  'inter',
      coverQuote:            null,
      coverQuoteAttribution: null,
      createdAt:             new Date(),
      updatedAt:             new Date(),
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid hex color', () => {
    const result = BrandSchema.safeParse({
      id:                    'b1',
      userId:                'u1',
      logoR2Key:             null,
      primaryColor:          'not-a-hex',
      accentColor:           '#818cf8',
      font:                  'inter',
      coverQuote:            null,
      coverQuoteAttribution: null,
      createdAt:             new Date(),
      updatedAt:             new Date(),
    })
    expect(result.success).toBe(false)
  })
})
