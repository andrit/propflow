'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Proposal, Section } from '@/lib/proposals/schemas'
import type { Brand } from '@/lib/brand/schemas'

function fmtCurrency(amount: number, currency: string): string {
  const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency + ' '
  return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

// ── Section renderers ──────────────────────────────────────────────────────

function ClientInfoSection({ content, client }: { content: Record<string, unknown>; client: Proposal['client'] }) {
  const name    = (content.name    as string) || client.name
  const company = (content.company as string) || client.company
  const email   = (content.email   as string) || client.email
  const phone   = content.phone   as string | undefined
  const start   = content.projectStart as string | undefined

  const fields = [
    ['Company',       company],
    ['Contact',       name],
    ['Email',         email],
    ['Phone',         phone],
    ['Project Start', start],
  ].filter(([, v]) => v)

  return (
    <div className="grid grid-cols-2 gap-4 bg-indigo-50 border-l-2 border-indigo-500 rounded-r-lg p-4">
      {fields.map(([label, value]) => (
        <div key={label as string}>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
          <p className="text-sm font-medium text-gray-800">{value}</p>
        </div>
      ))}
    </div>
  )
}

function ScopeSection({ content }: { content: Record<string, unknown> }) {
  return <p className="text-sm text-gray-700 leading-relaxed">{content.description as string}</p>
}

function DeliverablesSection({ content }: { content: Record<string, unknown> }) {
  const items = (content.items as { title: string; description?: string }[]) ?? []
  return (
    <div className="flex flex-col gap-4">
      {items.map((item, i) => (
        <div key={i} className="flex gap-4">
          <div className="w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{item.title}</p>
            {item.description && <p className="text-sm text-gray-600 mt-1">{item.description}</p>}
          </div>
        </div>
      ))}
    </div>
  )
}

function PricingSection({ content, currency }: { content: Record<string, unknown>; currency: string }) {
  const items = (content.lineItems as { description: string; quantity: number; unitRate: number; total: number }[]) ?? []
  const discount = content.discount as { label: string; amount: number } | undefined
  const subtotal = items.reduce((s, i) => s + i.total, 0)
  const discountAmt = discount?.amount ?? 0
  const total = subtotal - discountAmt
  const fmt = (n: number) => fmtCurrency(n, currency)

  return (
    <div>
      <table className="w-full text-sm mb-4">
        <thead>
          <tr className="border-b border-gray-200 text-xs font-semibold text-gray-400 uppercase tracking-wide">
            <th className="text-left pb-2">Description</th>
            <th className="text-right pb-2">Qty</th>
            <th className="text-right pb-2">Rate</th>
            <th className="text-right pb-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i} className={`border-b border-gray-100 ${i % 2 === 1 ? 'bg-indigo-50/50' : ''}`}>
              <td className="py-2.5 text-gray-800 font-medium">{item.description}</td>
              <td className="py-2.5 text-right text-gray-600">{item.quantity}</td>
              <td className="py-2.5 text-right text-gray-600">{fmt(item.unitRate)}</td>
              <td className="py-2.5 text-right font-medium text-gray-800">{fmt(item.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex flex-col items-end gap-1.5 text-sm">
        <div className="flex gap-10"><span className="text-gray-500">Subtotal</span><span className="w-24 text-right">{fmt(subtotal)}</span></div>
        {discount && (
          <div className="flex gap-10"><span className="text-gray-500">{discount.label}</span><span className="w-24 text-right text-red-500">−{fmt(discountAmt)}</span></div>
        )}
        <div className="border-t border-gray-200 pt-1.5 flex gap-10 items-center">
          <span className="font-bold text-indigo-700 uppercase tracking-wide text-xs">Total</span>
          <span className="font-bold text-indigo-700 text-lg w-24 text-right">{fmt(total)}</span>
        </div>
      </div>
    </div>
  )
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function TermsSection({ content }: { content: Record<string, unknown> }) {
  const text = (content.text as string) ?? ''
  return (
    <div className="text-xs text-gray-500 leading-relaxed space-y-2">
      {text.split(/\n\n+/).map((para, i) => {
        // Escape HTML first, then apply safe **bold** → <strong> transform
        const safe = escapeHtml(para).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        return <p key={i} dangerouslySetInnerHTML={{ __html: safe }} />
      })}
    </div>
  )
}

function renderSection(section: Section, proposal: Proposal) {
  const c = section.content as Record<string, unknown>
  switch (section.type) {
    case 'client-info':   return <ClientInfoSection content={c} client={proposal.client} />
    case 'scope':         return <ScopeSection content={c} />
    case 'deliverables':  return <DeliverablesSection content={c} />
    case 'pricing':       return <PricingSection content={c} currency={proposal.currency} />
    case 'terms':         return <TermsSection content={c} />
    default:              return c.text ? <p className="text-sm text-gray-700">{c.text as string}</p> : null
  }
}

// ── Main share view ────────────────────────────────────────────────────────

export default function ShareView({
  proposal, brand, pdfDownloadUrl, latestShareToken,
}: {
  proposal: Proposal
  brand: Brand | null
  pdfDownloadUrl: string | null
  latestShareToken: string | null
}) {
  const [pdfReady, setPdfReady] = useState(!!pdfDownloadUrl)
  const [downloadUrl, setDownloadUrl] = useState(pdfDownloadUrl)

  // Poll for PDF readiness if not yet generated
  useEffect(() => {
    if (pdfReady) return
    const interval = setInterval(async () => {
      const res = await fetch(`/api/proposals/${proposal.id}/pdf-status`)
      if (res.ok) {
        const data = await res.json()
        if (data.ready) {
          setPdfReady(true)
          clearInterval(interval)
          // Re-fetch the download URL from server — for now show the status
        }
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [pdfReady, proposal.id])

  const primary = '#4f46e5'
  const sections = [...proposal.sections].sort((a, b) => a.orderIndex - b.orderIndex)
  const expiryText = proposal.expiryAt ? `Valid until ${formatDate(proposal.expiryAt)}` : 'No expiry'

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Superseded banner */}
      {proposal.supersededById && latestShareToken && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 text-center">
          <span className="text-sm text-amber-800">
            An updated version of this proposal is available.{' '}
            <Link href={`/p/${latestShareToken}`} className="font-semibold underline">View latest →</Link>
          </span>
        </div>
      )}

      {/* Download bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-700 truncate">{proposal.title}</p>
        {pdfReady && downloadUrl ? (
          <a
            href={downloadUrl}
            download
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            ↓ Download PDF
          </a>
        ) : (
          <span className="text-xs text-gray-400 animate-pulse">PDF generating…</span>
        )}
      </div>

      {/* Document */}
      <div className="max-w-3xl mx-auto my-8 px-4">
        {/* Cover */}
        <div className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden">
          {/* Accent */}
          <div className="h-2" style={{ background: primary }} />
          <div className="px-8 py-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Proposal</p>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{proposal.title}</h1>
            <p className="text-xl text-gray-500">For {proposal.client.company || proposal.client.name}</p>
            <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-2 gap-6 text-sm">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Prepared for</p>
                <p className="font-medium text-gray-800">{proposal.client.name}</p>
                {proposal.client.company && <p className="text-gray-600">{proposal.client.company}</p>}
                <p className="text-gray-600">{proposal.client.email}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Date</p>
                <p className="font-medium text-gray-800">{formatDate(proposal.createdAt)}</p>
                <p className="text-gray-500 text-xs mt-1">{expiryText}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sections */}
        {sections
          .filter(s => {
            const c = s.content as Record<string, unknown>
            if (s.type === 'pricing') return Array.isArray(c.lineItems) && (c.lineItems as unknown[]).length > 0
            if (s.type === 'deliverables') return Array.isArray(c.items) && (c.items as unknown[]).length > 0
            return Object.values(c).some(v => v !== undefined && v !== '' && v !== null)
          })
          .map(section => (
            <div key={section.id} className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden">
              <div className="px-6 py-3 border-b border-gray-100 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full" style={{ background: primary }} />
                <h2 className="font-semibold text-gray-900">{section.title}</h2>
              </div>
              <div className="px-6 py-5">
                {renderSection(section, proposal)}
              </div>
            </div>
          ))}

        <p className="text-center text-xs text-gray-400 mt-8 pb-8">Prepared by propflow.co</p>
      </div>
    </div>
  )
}
