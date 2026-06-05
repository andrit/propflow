# propflow — Freelance Proposal Builder

**Priority:** #2 in factory build queue
**Status:** Phase 1 — Scaffold
**Stack:** `next-clerk-stripe-railway`
**Category:** business-productivity
**Target audience:** freelancers, solopreneurs

---

## What This App Does

Wizard-style web app: fill in scope, deliverables, timeline, pricing, and terms — get a polished, branded PDF proposal. Custom logo upload, color themes, reusable templates.

---

## Domain Summary (from Phase 0)

**Core Domain:** Proposal Authoring — the quality of the editing experience and professional output is the competitive moat.

**Aggregate Roots:**
- `Proposal` (draft → finalized → archived)
- `Template` (reusable structure; applying creates a new Proposal, never mutates the Template)
- `Brand` (one per user: logo R2 key, colors, font)

**Key Invariants:**
- Cannot finalize without complete client-info, scope, and pricing sections
- Finalized proposals cannot be edited — archive and create new
- Free tier: 1 proposal/month, no custom branding, default templates only
- Pro tier: unlimited proposals, custom branding, 5 saved templates
- Teams tier: 3 seats, shared templates

**See:** `event-storm.md`, `bounded-contexts.md`, `GLOSSARY.md`

---

## Architecture Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| PDF engine | Puppeteer (HTML → PDF) | Pixel-perfect browser render; Railway already in stack so no extra infra cost |
| Database | Drizzle ORM + postgres.js (Railway Postgres) | Type-safe, no codegen overhead |
| File storage | Cloudflare R2 | Logo uploads + generated PDFs |
| Auth | Clerk | Reused from imgscalr pattern |
| Billing | Stripe subscription (Pro $9/mo, Teams $19/mo) | Recurring revenue vs one-time |

---

## Tech Stack

**Template:** `next-clerk-stripe-railway`
**Hosting:** Railway
**Requires database:** Yes (Railway Postgres)
**Requires file storage:** Yes (Cloudflare R2)
**Requires AI API:** No

### Key Dependencies
- `puppeteer` — HTML → PDF via headless Chromium (Railway service)
- `drizzle-orm` + `postgres` — type-safe DB layer
- `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner` — R2 file storage
- `@clerk/nextjs` — authentication
- `stripe` — subscription billing
- `zod` — schema validation
- `nanoid` — ID generation

---

## Pricing

**Model:** subscription
- **Free:** 1 proposal/month, default template, no custom branding
- **Pro ($9/mo):** unlimited proposals, custom branding, 5 saved templates
- **Teams ($19/mo):** 3 seats, shared templates

---

## Environment Variables

```
# Required — copy .env.local.example to .env.local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRO_MONTHLY_PRICE_ID=
STRIPE_PRO_ANNUAL_PRICE_ID=
STRIPE_TEAMS_MONTHLY_PRICE_ID=
STRIPE_TEAMS_ANNUAL_PRICE_ID=
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=propflow
DATABASE_URL=postgresql://...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Key Files

| File | Purpose |
|------|---------|
| `lib/tiers.ts` | Tier definitions (free/pro/teams) + limit constants |
| `lib/stripe.ts` | Stripe client + price IDs + PRICING constants |
| `lib/auth.ts` | `requireAuth()` helper for API routes |
| `lib/r2.ts` | R2 client + `r2Keys` path builders (logo, proposal PDF) |
| `lib/db/index.ts` | Drizzle client (postgres.js driver) |
| `lib/db/schema.ts` | DB schema — Phase 2 |
| `lib/env.ts` | Startup env validation (via instrumentation.ts) |
| `middleware.ts` | Clerk auth — public: `/`, `/pricing`, `/p/[token]` |
| `drizzle.config.ts` | Drizzle Kit migration config |
| `event-storm.md` | Phase 0 domain events, commands, policies |
| `bounded-contexts.md` | Bounded contexts, aggregates, domain events |
| `GLOSSARY.md` | Ubiquitous language — canonical term definitions |

---

## Build Phases

| Phase | Status |
|-------|--------|
| 0 — Plan & spec approved | ✅ 2026-06-03 |
| 1 — Scaffold approved | ✅ 2026-06-03 |
| 2 — Core schema approved | ✅ 2026-06-04 |
| 2D — Design session approved | ✅ 2026-06-04 |
| 3 — Features complete | ✅ 2026-06-04 |
| 4 — Billing verified | ✅ 2026-06-04 |
| 5 — Polish & production config | ⬜ |
| 6 — Extract to feature-graph | ⬜ |
| 7 — Export artifact | ⬜ |

---

## Factory Rules

- Read skill files before writing any code
- Enforce tier limits server-side always — never client-only
- One phase per session — no scope expansion
- Never rewrite — fix forward
- Update `queue.json` after each approved phase

---

## Build Log

| Date | Phase | Summary |
|------|-------|---------|
| 2026-06-03 | 0 | Phase 0 complete. event-storm.md, bounded-contexts.md, GLOSSARY.md written. PDF: @react-pdf/renderer. DB: Drizzle + Railway Postgres. |
