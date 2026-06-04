import type { Proposal, Section } from '@/lib/proposals/schemas'
import type { Brand } from '@/lib/brand/schemas'
import type { Tier } from '@/lib/tiers'

const DEFAULT_QUOTE = `"Your work is going to fill a large part of your life, and the only way to be truly satisfied is to do what you believe is great work."`
const DEFAULT_QUOTE_ATTRIBUTION = 'Steve Jobs'

const GOOGLE_FONTS: Record<string, string> = {
  inter:       'Inter:wght@400;500;600;700;800',
  merriweather:'Merriweather:ital,wght@0,400;0,700;1,400',
  playfair:    'Playfair+Display:ital,wght@0,600;0,700;1,600',
}

export function generateProposalHtml(
  proposal: Proposal,
  brand: Brand | null,
  tier: Tier
): string {
  const isProOrTeams = tier !== 'free'
  const primary = isProOrTeams && brand?.primaryColor ? brand.primaryColor : '#4f46e5'
  const font    = isProOrTeams && brand?.font         ? brand.font         : 'inter'
  const tmpl    = proposal.template ?? 'clean'

  const primary12 = hexToRgba(primary, 0.12)
  const primary40 = hexToRgba(primary, 0.40)

  // Cover quote (Executive only) — proposal override → brand default → propflow default
  const coverQuote = proposal.coverQuoteOverride
    ?? brand?.coverQuote
    ?? DEFAULT_QUOTE
  const coverQuoteAttribution = proposal.coverQuoteAttributionOverride
    ?? brand?.coverQuoteAttribution
    ?? DEFAULT_QUOTE_ATTRIBUTION

  // Freelancer display name: use brand identity placeholder for now
  // Phase 5 will pull from Clerk user profile
  const freelancerName = 'Your Name'
  const freelancerDomain = ''

  // Expiry footer text
  const expiryText = proposal.expiryAt
    ? `Valid until ${formatDate(proposal.expiryAt)}`
    : 'No expiry'

  const footerRight = isProOrTeams ? '' : 'Prepared by propflow.co'

  const fontsUrl = buildFontsUrl(font, tmpl)
  const css = buildCss(primary, primary12, primary40, font, tmpl)
  const body = tmpl === 'executive'
    ? buildExecutiveBody(proposal, brand, isProOrTeams, freelancerName, freelancerDomain, coverQuote, coverQuoteAttribution, expiryText, footerRight)
    : buildCleanBody(proposal, brand, isProOrTeams, freelancerName, freelancerDomain, expiryText, footerRight)

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${fontsUrl}" rel="stylesheet">
<style>${css}</style>
</head>
<body>
${body}
</body>
</html>`
}

// ── Cover builders ────────────────────────────────────────────────────────────

function buildCleanBody(
  p: Proposal, brand: Brand | null, isPro: boolean,
  name: string, domain: string, expiryText: string, footerRight: string
): string {
  const client = p.client
  const logoHtml = '' // Phase 5: base64 logo from R2

  return `
<div class="page cover">
  <div class="cover-body">
    <div class="cover-logo">
      ${logoHtml || `<span class="cover-logo-name">${name}</span>`}
    </div>
    <div class="cover-mid">
      <span class="cover-eyebrow">Proposal</span>
      <h1 class="cover-title">${esc(p.title)}</h1>
      <p class="cover-for">For ${esc(client.company || client.name)}</p>
    </div>
  </div>
  <div class="cover-footer">
    <div>
      <div class="cf-label">Prepared for</div>
      <div class="cf-value">${esc(client.name)}<br>${esc(client.company ?? '')}<br>${esc(client.email)}</div>
    </div>
    <div>
      <div class="cf-label">Prepared by</div>
      <div class="cf-value">${esc(name)}${domain ? `<br>${esc(domain)}` : ''}<br>${formatDate(p.createdAt)}</div>
    </div>
  </div>
</div>
${buildBodyPages(p, expiryText, footerRight, 'clean')}`
}

function buildExecutiveBody(
  p: Proposal, brand: Brand | null, isPro: boolean,
  name: string, domain: string,
  quote: string, quoteAttribution: string,
  expiryText: string, footerRight: string
): string {
  const client = p.client
  const logoHtml = '' // Phase 5

  return `
<div class="page cover">
  <div class="cover-band">
    <div class="cover-band-logo">
      ${logoHtml || `<span class="cover-band-name">${esc(name)}</span>`}
    </div>
    <div class="cover-band-content">
      <span class="cover-band-eyebrow">Proposal</span>
      <h1 class="cover-band-title">${esc(p.title)}</h1>
      <p class="cover-band-for">For ${esc(client.company || client.name)}</p>
    </div>
  </div>
  <div class="cover-body">
    ${quote ? `<div class="cover-quote-block">
      <p class="cover-quote-text">${esc(quote)}</p>
      <span class="cover-quote-attr">— ${esc(quoteAttribution)}</span>
    </div>` : ''}
  </div>
  <div class="cover-footer">
    <div>
      <div class="cf-label">Prepared for</div>
      <div class="cf-value">${esc(client.name)}<br>${esc(client.company ?? '')}<br>${esc(client.email)}</div>
    </div>
    <div>
      <div class="cf-label">Prepared by</div>
      <div class="cf-value">${esc(name)}${domain ? `<br>${esc(domain)}` : ''}<br>${formatDate(p.createdAt)}</div>
    </div>
  </div>
</div>
${buildBodyPages(p, expiryText, footerRight, 'executive')}`
}

// ── Section renderer ──────────────────────────────────────────────────────────

function buildBodyPages(p: Proposal, expiryText: string, footerRight: string, tmpl: string): string {
  const sections = [...p.sections].sort((a, b) => a.orderIndex - b.orderIndex)
  let pageNum = 2

  return sections
    .filter(s => hasContent(s))
    .map(s => {
      const html = `
<div class="page body-page">
  <div class="pg-header">
    <span class="pg-header-left">propflow</span>
    <span class="pg-header-right">${esc(p.title)} · Page ${pageNum++}</span>
  </div>
  <div class="pg-content">
    ${renderSection(s, tmpl)}
  </div>
  <div class="pg-footer">
    <span>${esc(expiryText)}</span>
    <span>${esc(footerRight)}</span>
  </div>
</div>`
      return html
    })
    .join('\n')
}

function renderSection(s: Section, tmpl: string): string {
  const heading = tmpl === 'executive'
    ? `<div class="s-band"><span class="s-heading">${esc(s.title)}</span></div><div class="s-content">`
    : `<div class="section"><h2 class="s-heading">${esc(s.title)}</h2><div class="s-rule"></div>`

  const close = '</div>'
  const inner = renderSectionContent(s)
  return `${heading}${inner}${close}`
}

function renderSectionContent(s: Section): string {
  const c = s.content as Record<string, unknown>

  switch (s.type) {
    case 'client-info': return renderClientInfo(c)
    case 'scope':       return renderScope(c)
    case 'deliverables':return renderDeliverables(c)
    case 'pricing':     return renderPricing(c)
    case 'terms':       return renderTerms(c)
    default:            return c.text ? `<p class="body-text">${esc(String(c.text))}</p>` : ''
  }
}

function renderClientInfo(c: Record<string, unknown>): string {
  const fields = [
    ['Company',       c.company],
    ['Contact',       c.name],
    ['Email',         c.email],
    ['Phone',         c.phone],
    ['Project Start', c.projectStart],
  ].filter(([, v]) => v)

  return `<div class="client-card">${fields.map(([l, v]) => `
    <div><div class="cc-label">${l}</div><div class="cc-value">${esc(String(v))}</div></div>`).join('')}
  </div>`
}

function renderScope(c: Record<string, unknown>): string {
  const parts: string[] = []
  if (c.description) parts.push(`<p class="body-text">${esc(String(c.description))}</p>`)
  if (Array.isArray(c.inclusions) && c.inclusions.length) {
    parts.push(`<p class="body-text"><strong>Includes:</strong></p><ul class="list-disc pl-5 body-text">${(c.inclusions as string[]).map(i => `<li>${esc(i)}</li>`).join('')}</ul>`)
  }
  return parts.join('')
}

function renderDeliverables(c: Record<string, unknown>): string {
  const items = (c.items as { title: string; description?: string }[]) ?? []
  if (!items.length) return '<p class="body-text">No deliverables listed.</p>'
  return `<div class="deliverables">${items.map((item, i) => `
    <div class="dlv">
      <div class="dlv-num">${i + 1}</div>
      <div>
        <div class="dlv-title">${esc(item.title)}</div>
        ${item.description ? `<div class="dlv-desc">${esc(item.description)}</div>` : ''}
      </div>
    </div>`).join('')}</div>`
}

function renderPricing(c: Record<string, unknown>): string {
  const items = (c.lineItems as { description: string; quantity: number; unitRate: number; total: number }[]) ?? []
  const discount = c.discount as { label: string; amount: number } | undefined
  const currency = (c.currency as string) ?? ''

  const subtotal = items.reduce((s, i) => s + i.total, 0)
  const discountAmt = discount?.amount ?? 0
  const total = subtotal - discountAmt

  const rows = items.map((item, i) => `
    <tr class="${i % 2 === 1 ? 'row-alt' : ''}">
      <td class="bold">${esc(item.description)}</td>
      <td class="r">${item.quantity}</td>
      <td class="r">${fmtCurrency(item.unitRate, currency)}</td>
      <td class="r">${fmtCurrency(item.total, currency)}</td>
    </tr>`).join('')

  return `
  <table class="pricing-table">
    <thead><tr>
      <th style="width:54%">Description</th>
      <th class="r" style="width:10%">Qty</th>
      <th class="r" style="width:16%">Rate</th>
      <th class="r" style="width:20%">Total</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="pricing-summary">
    <div class="ps-row"><span class="lbl">Subtotal</span><span class="amt">${fmtCurrency(subtotal, currency)}</span></div>
    ${discount ? `<div class="ps-row discount"><span class="lbl">${esc(discount.label)}</span><span class="amt">−${fmtCurrency(discountAmt, currency)}</span></div>` : ''}
    <div class="ps-divider"></div>
    <div class="total-box"><span class="total-lbl">Total</span><span class="total-amt">${fmtCurrency(total, currency)}</span></div>
  </div>`
}

function renderTerms(c: Record<string, unknown>): string {
  const text = (c.text as string) ?? ''
  const paragraphs = text.split(/\n\n+/).map(p =>
    `<p class="terms">${p.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>')}</p>`
  )
  return paragraphs.join('')
}

// ── CSS ───────────────────────────────────────────────────────────────────────

function buildCss(primary: string, primary12: string, primary40: string, font: string, tmpl: string): string {
  const headingFont = tmpl === 'executive' && font === 'playfair'
    ? "'Playfair Display', Georgia, serif"
    : `'${capitalize(font)}', system-ui, sans-serif`

  return `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --primary: ${primary};
  --primary-12: ${primary12};
  --primary-40: ${primary40};
  --dark: #111827; --body: #374151; --sub: #1f2937;
  --label: #6b7280; --meta: #9ca3af; --border: #e5e7eb;
}
@page { size: A4; margin: 0; }
body { background: white; font-family: 'Inter', system-ui, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.page { width: 794px; min-height: 1123px; background: white; position: relative; overflow: hidden; page-break-after: always; }

/* ── Clean cover ── */
.cover { min-height: 1123px; display: flex; flex-direction: column; position: relative; }
.cover::before { content: ''; position: absolute; inset: 0 auto 0 0; width: 6px; background: var(--primary); }
.cover-body { flex: 1; display: flex; flex-direction: column; padding: 48px 48px 48px 52px; }
.cover-logo { display: flex; align-items: center; gap: 10px; }
.cover-logo-name { font-size: 15px; font-weight: 700; color: var(--dark); }
.cover-mid { margin-top: auto; padding-bottom: 72px; }
.cover-eyebrow { display: block; font-size: 11px; font-weight: 600; letter-spacing: .16em; text-transform: uppercase; color: var(--meta); margin-bottom: 18px; }
.cover-title { font-size: 28px; font-weight: 700; color: var(--dark); line-height: 1.2; letter-spacing: -.4px; margin-bottom: 14px; }
.cover-for { font-size: 20px; font-weight: 400; color: var(--label); }
.cover-footer { border-top: 1px solid var(--border); padding: 22px 48px 22px 52px; display: grid; grid-template-columns: 1fr 1fr; gap: 0 40px; }

/* ── Executive cover ── */
.cover-band { height: 302px; background: var(--primary); padding: 32px 20mm; display: flex; flex-direction: column; }
.cover-band-name { font-size: 15px; font-weight: 600; color: rgba(255,255,255,.90); }
.cover-band-content { margin-top: auto; }
.cover-band-eyebrow { display: block; font-size: 11px; font-weight: 600; letter-spacing: .16em; text-transform: uppercase; color: rgba(255,255,255,.60); margin-bottom: 12px; }
.cover-band-title { font-family: ${headingFont}; font-size: 30px; font-weight: 700; color: white; line-height: 1.18; margin-bottom: 10px; }
.cover-band-for { font-size: 16px; font-weight: 400; color: rgba(255,255,255,.75); }
.cover-body { flex: 1; padding: 36px 20mm 0; }
.cover-quote-block { max-width: 500px; }
.cover-quote-text { font-family: ${headingFont}; font-style: italic; font-size: 13px; color: var(--label); line-height: 1.65; }
.cover-quote-attr { display: block; font-size: 11px; color: var(--meta); margin-top: 8px; }

/* ── Shared cover footer ── */
.cf-label { font-size: 10px; font-weight: 600; letter-spacing: .10em; text-transform: uppercase; color: var(--meta); margin-bottom: 7px; }
.cf-value { font-size: 13px; font-weight: 500; color: var(--sub); line-height: 1.55; }
.cover-footer { border-top: 1px solid var(--border); padding: 22px 20mm; display: grid; grid-template-columns: 1fr 1fr; gap: 0 40px; }

/* ── Body pages ── */
.body-page { display: flex; flex-direction: column; min-height: 1123px; }
.pg-header { display: flex; justify-content: space-between; padding: 12px 16mm; border-bottom: 1px solid #f3f4f6; flex-shrink: 0; }
.pg-header-left, .pg-header-right { font-size: 10px; font-weight: 500; color: var(--meta); }
.pg-content { flex: 1; padding: 24px 16mm 52px; }
.pg-footer { display: flex; justify-content: space-between; padding: 10px 16mm; border-top: 1px solid #f3f4f6; flex-shrink: 0; font-size: 10px; color: var(--meta); }

/* ── Section headings (Clean) ── */
.section { margin-bottom: 28px; }
.s-heading { font-size: 16px; font-weight: 700; color: var(--primary); margin-bottom: 6px; }
.s-rule { height: 1px; background: var(--primary-40); margin-bottom: 18px; }

/* ── Section headings (Executive) ── */
.s-band { background: var(--primary-12); padding: 9px 16mm; margin: 0 -16mm 18px; display: flex; align-items: center; gap: 10px; }
.s-band .s-heading { font-size: 12px; font-weight: 600; letter-spacing: .12em; text-transform: uppercase; color: var(--primary); font-family: 'Inter', sans-serif; }
.s-content { }

/* ── Client card ── */
.client-card { background: var(--primary-12); border-left: 2px solid var(--primary); border-radius: 0 6px 6px 0; padding: 16px 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 13px 40px; }
.cc-label { font-size: 10px; font-weight: 600; letter-spacing: .09em; text-transform: uppercase; color: var(--label); margin-bottom: 3px; }
.cc-value { font-size: 12px; font-weight: 500; color: var(--sub); }

/* ── Body text ── */
.body-text { font-size: 12px; color: var(--body); line-height: 1.65; }

/* ── Deliverables ── */
.deliverables { display: flex; flex-direction: column; gap: 18px; }
.dlv { display: grid; grid-template-columns: 26px 1fr; gap: 0 12px; align-items: start; }
.dlv-num { width: 26px; height: 26px; border-radius: 50%; background: var(--primary); color: white; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px; }
.dlv-title { font-family: ${headingFont}; font-size: 13px; font-weight: 600; color: var(--sub); margin-bottom: 5px; }
.dlv-desc { font-size: 12px; color: var(--body); line-height: 1.6; }

/* ── Pricing ── */
.pricing-table { width: 100%; border-collapse: collapse; font-size: 12px; }
.pricing-table thead th { font-size: 10px; font-weight: 600; letter-spacing: .09em; text-transform: uppercase; color: var(--label); padding: 8px 10px; text-align: left; border-bottom: 1px solid var(--border); }
.pricing-table thead th.r { text-align: right; }
.pricing-table tbody tr { background: white; }
.pricing-table tbody tr.row-alt { background: var(--primary-12); }
.pricing-table tbody td { padding: 11px 10px; color: var(--sub); }
.pricing-table tbody td.r { text-align: right; font-variant-numeric: tabular-nums; }
.pricing-table tbody td.bold { font-weight: 500; }
.pricing-summary { display: flex; flex-direction: column; align-items: flex-end; gap: 5px; margin-top: 10px; }
.ps-row { display: flex; gap: 40px; font-size: 12px; color: var(--body); }
.ps-row .lbl { min-width: 130px; text-align: right; color: var(--label); }
.ps-row .amt { min-width: 68px; text-align: right; font-variant-numeric: tabular-nums; }
.ps-row.discount .amt { color: #dc2626; }
.ps-divider { width: 240px; height: 1px; background: var(--border); margin: 4px 0; }
.total-box { border: 2px solid var(--primary); border-radius: 5px; padding: 9px 14px; display: flex; align-items: center; gap: 40px; margin-top: 2px; }
.total-lbl { font-size: 11px; font-weight: 600; color: var(--primary); letter-spacing: .08em; text-transform: uppercase; }
.total-amt { font-size: 16px; font-weight: 700; color: var(--primary); font-variant-numeric: tabular-nums; min-width: 68px; text-align: right; }

/* ── Terms ── */
.terms { font-size: 11px; color: var(--label); line-height: 1.65; margin-bottom: 8px; }
`
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildFontsUrl(font: string, tmpl: string): string {
  const families = [`family=${GOOGLE_FONTS['inter']}`]
  if (font !== 'inter' && GOOGLE_FONTS[font]) families.push(`family=${GOOGLE_FONTS[font]}`)
  if (tmpl === 'executive' && font !== 'playfair') families.push(`family=${GOOGLE_FONTS['playfair']}`)
  return `https://fonts.googleapis.com/css2?${families.join('&')}&display=swap`
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function fmtCurrency(amount: number, currency: string): string {
  const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency + ' '
  return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function esc(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function hasContent(s: Section): boolean {
  const c = s.content as Record<string, unknown>
  if (s.type === 'pricing') return Array.isArray(c.lineItems) && (c.lineItems as unknown[]).length > 0
  if (s.type === 'deliverables') return Array.isArray(c.items) && (c.items as unknown[]).length > 0
  return Object.keys(c).some(k => {
    const v = c[k]
    return v !== undefined && v !== '' && v !== null
  })
}
