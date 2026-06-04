import { nanoid } from 'nanoid'
import type { Tier } from '../tiers'

export type DomainEvent =
  | { type: 'proposal.finalized';    payload: { proposalId: string; userId: string } }
  | { type: 'proposal.shared';       payload: { proposalId: string; shareToken: string } }
  | { type: 'pdf.render.requested';  payload: { proposalId: string; userId: string } }
  | { type: 'export.limit.reached';  payload: { userId: string; tier: Tier } }
  | { type: 'template.applied';      payload: { templateId: string; newProposalId: string } }

export interface EventEnvelope {
  id:          string
  type:        string
  occurredAt:  Date
  aggregateId: string
  userId?:     string
}

export function makeEnvelope(event: DomainEvent, aggregateId: string, userId?: string): EventEnvelope {
  return {
    id:         nanoid(),
    type:       event.type,
    occurredAt: new Date(),
    aggregateId,
    userId,
  }
}

// Simple in-process event bus for now — replace with a queue in production
type Handler = (event: DomainEvent) => Promise<void>
const handlers = new Map<string, Handler[]>()

export const eventBus = {
  subscribe(type: DomainEvent['type'], handler: Handler) {
    const existing = handlers.get(type) ?? []
    handlers.set(type, [...existing, handler])
  },
  async publish(event: DomainEvent) {
    const fns = handlers.get(event.type) ?? []
    await Promise.all(fns.map(fn => fn(event)))
  },
}
