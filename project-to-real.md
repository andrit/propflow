# propflow — Project to Real

> Generated at Phase 7 completion. Every item here requires a real-world action
> that cannot be completed by running code in this repository.
>
> **Legend:** 🔴 Blocker (app cannot run without this) · 🟡 Important (app runs but is broken/insecure) · 🟢 Nice-to-have

---

## 1. Domain & DNS

| Item | Status | Notes |
|------|--------|-------|
| 🔴 Register domain `propflow.app` (or your preferred domain) | ⬜ | Cloudflare Registrar (cheapest), Porkbun, Namecheap |
| 🔴 Add domain to Railway project | ⬜ | Railway → Project → Settings → Domains |
| 🔴 Set DNS CNAME to Railway-provided hostname | ⬜ | Railway provides the value after domain is added |
| 🟡 Enable DNSSEC | ⬜ | If your registrar supports it |

---

## 2. Email

| Item | Status | Notes |
|------|--------|-------|
| 🔴 Set up `privacy@propflow.app` | ⬜ | Cloudflare Email Routing (free forward) is sufficient for MVP |
| 🟡 Set up `support@propflow.app` | ⬜ | Can forward to same inbox as privacy |
| 🟡 SPF + DKIM + DMARC records | ⬜ | Required to avoid spam folder if sending transactional email |

> **Code note:** The footer currently links `mailto:privacy@propflow.app`. This works immediately with Cloudflare Email Routing — no full email hosting required.

---

## 3. Authentication — Clerk

| Item | Status | Notes |
|------|--------|-------|
| 🔴 Create Clerk account at clerk.com | ⬜ | |
| 🔴 Create application named `propflow` | ⬜ | |
| 🔴 Copy `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | ⬜ | Clerk dashboard → API Keys |
| 🔴 Copy `CLERK_SECRET_KEY` | ⬜ | Clerk dashboard → API Keys |
| 🔴 Add production domain to Clerk allowed origins | ⬜ | Clerk → Settings → Domains |
| 🟡 Configure social login (Google recommended) | ⬜ | Clerk → User & Authentication → Social Connections |
| 🟡 Customize Clerk sign-in appearance to match propflow brand | ⬜ | Clerk → Customization → Appearance |

---

## 4. Payments — Stripe

| Item | Status | Notes |
|------|--------|-------|
| 🔴 Create Stripe account | ⬜ | stripe.com |
| 🔴 Activate account (identity verification) | ⬜ | Required before live payments — takes 1–2 business days |
| 🔴 Create 4 products and prices (see table below) | ⬜ | |
| 🔴 Register webhook endpoint `https://[DOMAIN]/api/webhooks/stripe` | ⬜ | Stripe → Developers → Webhooks |
| 🔴 Select webhook events (see list below) | ⬜ | |
| 🔴 Copy `STRIPE_WEBHOOK_SECRET` (live mode) | ⬜ | Stripe → Webhooks → signing secret |
| 🔴 Copy `STRIPE_SECRET_KEY` (live mode, starts `sk_live_`) | ⬜ | |
| 🔴 Copy `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (live mode, starts `pk_live_`) | ⬜ | |
| 🔴 Copy all 4 price IDs into Railway env vars | ⬜ | |
| 🟡 Enable Stripe Customer Portal | ⬜ | Stripe → Settings → Billing → Customer portal → Enable. Without this, "Manage billing" button fails. |
| 🟡 Set Stripe branding (logo, colors) | ⬜ | Stripe → Settings → Branding |
| 🟡 Enable Stripe Tax if selling in tax jurisdictions | ⬜ | |

**Products to create in Stripe:**

| Product | Price | Billing | Env var |
|---------|-------|---------|---------|
| propflow Pro | $9/mo | Monthly | `STRIPE_PRO_MONTHLY_PRICE_ID` |
| propflow Pro | $79/yr | Annual | `STRIPE_PRO_ANNUAL_PRICE_ID` |
| propflow Teams | $19/mo | Monthly | `STRIPE_TEAMS_MONTHLY_PRICE_ID` |
| propflow Teams | $159/yr | Annual | `STRIPE_TEAMS_ANNUAL_PRICE_ID` |

**Webhook events to subscribe:**
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed` *(optional — for grace period handling)*

---

## 5. File Storage — Cloudflare R2

| Item | Status | Notes |
|------|--------|-------|
| 🔴 Create Cloudflare account | ⬜ | cloudflare.com |
| 🔴 Enable R2 (requires payment method, even for free tier) | ⬜ | R2 → Get started |
| 🔴 Create bucket named `propflow` | ⬜ | R2 → Create bucket (matches `R2_BUCKET_NAME=propflow` in env) |
| 🔴 Create API token: Object Read & Write on `propflow` bucket | ⬜ | R2 → Manage R2 API tokens |
| 🔴 Copy `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` | ⬜ | |
| 🟡 Set R2 lifecycle rule: expire `proposals/*/` prefix after 90 days | ⬜ | Belt-and-suspenders for finalized PDF storage |
| 🟡 Set R2 lifecycle rule: expire `logos/*/` after 365 days (inactive accounts) | ⬜ | |

---

## 6. Database — Railway Postgres

| Item | Status | Notes |
|------|--------|-------|
| 🔴 Create Railway account at railway.app | ⬜ | |
| 🔴 Create new project → Add Postgres plugin | ⬜ | Railway → New Project → Database → PostgreSQL |
| 🔴 Copy `DATABASE_URL` (includes credentials) | ⬜ | Railway → Postgres → Variables → `DATABASE_URL` |
| 🔴 Run migrations: `DATABASE_URL=... npx drizzle-kit migrate` | ⬜ | Run once from local against production DB before first deploy |
| 🟡 Enable daily backups in Railway | ⬜ | Railway Postgres → Settings → Backups |

> **Migration order:** Run `drizzle/0001_initial_schema.sql` then `drizzle/0002_add_design_fields.sql`. Drizzle Kit handles ordering automatically.

---

## 7. PDF Generation — Puppeteer on Railway

| Item | Status | Notes |
|------|--------|-------|
| 🔴 Deploy app to Railway (not Vercel) | ⬜ | propflow uses Puppeteer — requires persistent server, not serverless |
| 🔴 Set `PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium` in Railway env | ⬜ | |
| 🔴 Add Chromium to Dockerfile (or use Railway Nixpacks) | ⬜ | Nixpacks detects Next.js; add `nixpacks.toml` to install chromium |
| 🔴 Set `RENDER_SECRET` (32-char random string) | ⬜ | `openssl rand -hex 32` |

**nixpacks.toml** (create at project root):
```toml
[phases.setup]
aptPkgs = ["chromium", "fonts-liberation", "libgconf-2-4"]
```

---

## 8. Secrets to Generate Locally

```bash
# Internal render route secret (Puppeteer ↔ Next.js)
openssl rand -hex 32   # → RENDER_SECRET
```

---

## 9. Railway Deployment

| Item | Status | Notes |
|------|--------|-------|
| 🔴 Connect GitHub repo to Railway project | ⬜ | Railway → New Service → GitHub repo |
| 🔴 Set all env vars in Railway (see `.env.local.example`) | ⬜ | Railway → Service → Variables |
| 🔴 Set `NEXT_PUBLIC_APP_URL=https://[DOMAIN]` | ⬜ | Must be production URL, not localhost |
| 🔴 Set `NODE_ENV=production` | ⬜ | |
| 🟡 CI/CD builds will fail without real Clerk keys | ⬜ | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` must be set in CI env (GitHub Actions secrets, Railway CI vars, etc.). The test suite uses vitest and does not need Clerk, but `next build` imports Clerk and will error with a missing key. Set a sandbox Clerk key in CI. |
| 🟡 Configure health check: `GET /` returns 200 | ⬜ | Railway → Service → Settings → Health Check |
| 🟡 Set Railway sleep policy to "never" | ⬜ | Puppeteer cold starts take 10–15s on wake |

**Full env var checklist for Railway:**
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
STRIPE_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRO_MONTHLY_PRICE_ID
STRIPE_PRO_ANNUAL_PRICE_ID
STRIPE_TEAMS_MONTHLY_PRICE_ID
STRIPE_TEAMS_ANNUAL_PRICE_ID
R2_ACCOUNT_ID
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
R2_BUCKET_NAME=propflow
DATABASE_URL
NEXT_PUBLIC_APP_URL
RENDER_SECRET
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
```

---

## 10. Legal & Compliance

| Item | Status | Notes |
|------|--------|-------|
| 🔴 Write Privacy Policy page at `/privacy` | ⬜ | **Currently a mailto link — needs a real page.** Include: data collected (proposals, client names/emails), retention, cookies, GDPR rights, contact. Use iubenda.com or termly.io ($0–$29). |
| 🔴 Write Terms of Service page at `/terms` | ⬜ | Include: acceptable use, no storing illegal content in proposals, liability limits, refund policy (pro-rata or no refund). |
| 🔴 Update footer links from `mailto:` to `/privacy` | ⬜ | Code change: `LandingPage.tsx` line ~205 |
| 🟡 GDPR Cookie Consent banner (if serving EU users) | ⬜ | propflow sets no tracking cookies, but Clerk may set session cookies. Verify with Clerk docs. |
| 🟡 Register as Stripe MoR or use Paddle/Lemon Squeezy for VAT automation | ⬜ | Stripe requires you to handle VAT yourself in EU/UK. Paddle handles it automatically. |

---

## 11. Monitoring & Observability

| Item | Status | Notes |
|------|--------|-------|
| 🔴 Error tracking: Sentry (free tier) | ⬜ | `npm install @sentry/nextjs` — run init wizard, add `SENTRY_DSN` env var. **Required before launch** — Puppeteer PDF failures are silent 500s without Sentry; you won't know when proposal generation breaks in production. |
| 🟡 Uptime monitoring: UptimeRobot (free) | ⬜ | Monitor `GET /` — alert on downtime. Puppeteer process crash = silent 500 on PDF generation only, not homepage. |
| 🟡 Railway metrics dashboard | ⬜ | Railway built-in — watch memory (Chromium can spike to 300MB+) |
| 🟢 Privacy-friendly analytics: Plausible.io | ⬜ | $9/mo — no cookie consent needed |

---

## 12. Pre-Launch Smoke Test

Do this against the live production URL before announcing:

- [ ] Sign up → redirects to `/dashboard`
- [ ] Create new proposal (free tier) → wizard completes
- [ ] Fill all 5 section types → complete indicators appear
- [ ] Finalize proposal → share link generated
- [ ] Open share link in incognito → proposal renders without login
- [ ] PDF generating… → PDF ready within 10 seconds
- [ ] Download PDF → opens in PDF viewer, correct A4 format
- [ ] Try creating 2nd proposal on free tier → blocked with upgrade prompt
- [ ] Visit `/pricing` → upgrade to Pro via Stripe test mode (`4242 4242 4242 4242`)
- [ ] After webhook fires → dashboard shows "Pro plan"
- [ ] Create 2nd proposal → succeeds
- [ ] Brand settings → save custom colors → PDF uses those colors
- [ ] Customer portal → opens Stripe portal
- [ ] Cancel subscription in portal → tier reverts to Free at period end
- [ ] Run `curl -I https://[DOMAIN]` → verify `X-Frame-Options`, `CSP`, `HSTS` headers present
- [ ] Switch Stripe to **live mode**, create real prices, redo checkout with real card

---

## 13. Code Changes Still Needed Before Launch

| Change | File | Priority |
|--------|------|----------|
| Create `/privacy` page with real Privacy Policy | `app/privacy/page.tsx` | 🔴 Blocker |
| Create `/terms` page with real Terms of Service | `app/terms/page.tsx` | 🔴 Blocker |
| Update footer links from `mailto:` to `/privacy` and `/terms` | `components/LandingPage.tsx` | 🔴 After above |
| Add rate limiting to mutation API routes (create proposal, finalize, share) | `app/api/proposals/route.ts` + others | 🟡 Security |
| Implement logo upload on brand page (R2 upload already wired in schema) | `app/brand/page.tsx` | 🟡 Feature gap |
| Add `nixpacks.toml` for Chromium install on Railway | project root | 🔴 PDF generation |

---

## Summary — Minimum to Go Live

These are the absolute blockers — without all of these, the app either won't boot or won't be launchable:

1. Clerk application created → keys in Railway env (also add sandbox key to CI env for `next build`)
2. Stripe activated, 4 prices created, webhook registered, Stripe Customer Portal enabled
3. R2 bucket `propflow` created → keys in Railway env
4. Railway Postgres provisioned → `DATABASE_URL` in env → migrations run
5. `RENDER_SECRET` generated → in Railway env
6. `nixpacks.toml` created → Chromium installs at deploy
7. `NEXT_PUBLIC_APP_URL` set to production URL (not localhost)
8. Privacy Policy page live at `/privacy` with footer links updated
9. Sentry DSN configured → PDF generation failures are observable
10. App successfully deploys and health check passes
11. End-to-end PDF smoke test passes with a real proposal
