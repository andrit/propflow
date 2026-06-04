-- Phase 2D: add design fields from proposal-template-spec.md

ALTER TABLE proposals
  ADD COLUMN IF NOT EXISTS template        text         NOT NULL DEFAULT 'clean',
  ADD COLUMN IF NOT EXISTS expiry_at       timestamptz,
  ADD COLUMN IF NOT EXISTS currency        text         NOT NULL DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS cover_quote_override             text,
  ADD COLUMN IF NOT EXISTS cover_quote_attribution_override text;

ALTER TABLE brands
  ADD COLUMN IF NOT EXISTS cover_quote             text,
  ADD COLUMN IF NOT EXISTS cover_quote_attribution text;
