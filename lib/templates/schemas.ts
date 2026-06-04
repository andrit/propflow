import { z } from 'zod'
import { SECTION_TYPES } from '../proposals/schemas'

export const TemplateSectionSchema = z.object({
  id:         z.string(),
  templateId: z.string(),
  type:       z.enum(SECTION_TYPES),
  title:      z.string().min(1),
  content:    z.record(z.unknown()).default({}),
  orderIndex: z.number().int().nonnegative(),
})

export const TemplateSchema = z.object({
  id:          z.string(),
  userId:      z.string().nullable(),
  name:        z.string().min(1),
  description: z.string().nullable(),
  isBuiltin:   z.boolean(),
  sections:    z.array(TemplateSectionSchema).default([]),
  createdAt:   z.date(),
  updatedAt:   z.date(),
})

export const CreateTemplateSchema = z.object({
  name:        z.string().min(1).max(100),
  description: z.string().max(300).optional(),
  sections: z.array(z.object({
    type:    z.enum(SECTION_TYPES),
    title:   z.string().min(1).max(200),
    content: z.record(z.unknown()).optional(),
  })).min(1),
})

export type Template        = z.infer<typeof TemplateSchema>
export type TemplateSection = z.infer<typeof TemplateSectionSchema>
export type CreateTemplateInput = z.infer<typeof CreateTemplateSchema>
