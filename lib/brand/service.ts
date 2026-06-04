import { nanoid } from 'nanoid'
import { eq } from 'drizzle-orm'
import { db } from '../db'
import { brands } from '../db/schema'
import { assertCanApplyCustomBrand } from '../domain/invariants'
import type { Tier } from '../tiers'
import type { Brand, SaveBrandInput } from './schemas'

export async function getBrand(userId: string): Promise<Brand | null> {
  const [row] = await db.select().from(brands).where(eq(brands.userId, userId))
  if (!row) return null
  return rowToBrand(row)
}

export async function saveBrand(
  input: SaveBrandInput,
  userId: string,
  tier: Tier
): Promise<Brand> {
  // Only validate brand restriction when setting non-default values
  const isCustomizing = input.primaryColor || input.accentColor || input.font
  if (isCustomizing) assertCanApplyCustomBrand(tier)

  const existing = await getBrand(userId)

  if (existing) {
    await db.update(brands)
      .set({
        ...(input.primaryColor !== undefined && { primaryColor: input.primaryColor }),
        ...(input.accentColor  !== undefined && { accentColor:  input.accentColor }),
        ...(input.font         !== undefined && { font:          input.font }),
        ...(input.coverQuote             !== undefined && { coverQuote:             input.coverQuote }),
        ...(input.coverQuoteAttribution  !== undefined && { coverQuoteAttribution:  input.coverQuoteAttribution }),
        updatedAt: new Date(),
      })
      .where(eq(brands.userId, userId))
  } else {
    await db.insert(brands).values({
      id:                    nanoid(),
      userId,
      logoR2Key:             null,
      primaryColor:          input.primaryColor ?? '#4f46e5',
      accentColor:           input.accentColor  ?? '#818cf8',
      font:                  input.font         ?? 'inter',
      coverQuote:            input.coverQuote   ?? null,
      coverQuoteAttribution: input.coverQuoteAttribution ?? null,
    })
  }

  return (await getBrand(userId))!
}

export async function saveLogo(userId: string, logoR2Key: string, tier: Tier): Promise<Brand> {
  assertCanApplyCustomBrand(tier)

  const existing = await getBrand(userId)
  if (existing) {
    await db.update(brands)
      .set({ logoR2Key, updatedAt: new Date() })
      .where(eq(brands.userId, userId))
  } else {
    await db.insert(brands).values({
      id:        nanoid(),
      userId,
      logoR2Key,
      primaryColor: '#7c3aed',
      accentColor:  '#a78bfa',
      font:         'inter',
    })
  }

  return (await getBrand(userId))!
}

function rowToBrand(row: typeof brands.$inferSelect): Brand {
  return {
    id:                    row.id,
    userId:                row.userId,
    logoR2Key:             row.logoR2Key ?? null,
    primaryColor:          row.primaryColor,
    accentColor:           row.accentColor,
    font:                  row.font as Brand['font'],
    coverQuote:            row.coverQuote ?? null,
    coverQuoteAttribution: row.coverQuoteAttribution ?? null,
    createdAt:             row.createdAt,
    updatedAt:             row.updatedAt,
  }
}
