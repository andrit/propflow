import { z } from 'zod'

export const FONT_OPTIONS = ['inter', 'merriweather', 'playfair'] as const
export type FontOption = typeof FONT_OPTIONS[number]

const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color')

export const BrandSchema = z.object({
  id:                    z.string(),
  userId:                z.string(),
  logoR2Key:             z.string().nullable(),
  primaryColor:          hexColor,
  accentColor:           hexColor,
  font:                  z.enum(FONT_OPTIONS),
  coverQuote:            z.string().nullable(),
  coverQuoteAttribution: z.string().nullable(),
  createdAt:             z.date(),
  updatedAt:             z.date(),
})

export const SaveBrandSchema = z.object({
  primaryColor:          hexColor.optional(),
  accentColor:           hexColor.optional(),
  font:                  z.enum(FONT_OPTIONS).optional(),
  coverQuote:            z.string().max(400).nullable().optional(),
  coverQuoteAttribution: z.string().max(100).nullable().optional(),
})

export type Brand          = z.infer<typeof BrandSchema>
export type SaveBrandInput = z.infer<typeof SaveBrandSchema>
