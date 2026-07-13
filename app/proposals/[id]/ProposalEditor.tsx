'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Proposal, Section } from '@/lib/proposals/schemas'
import { INDUSTRY_CONFIG, type IndustryType } from '@/lib/industry-config'

// ── Types for section content ──────────────────────────────────────────────

type LineItem = { description: string; quantity: number; unitRate: number; total: number }
type Discount = { label: string; amount: number }
type DeliverableItem = { title: string; description?: string }

// ── Helpers ────────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<string, string> = {
  draft:     'bg-gray-100 text-gray-600',
  finalized: 'bg-blue-100 text-blue-700',
  archived:  'bg-amber-100 text-amber-700',
}

function completionColor(n: number): string {
  if (n === 100) return 'text-green-600'
  if (n >= 50)   return 'text-amber-600'
  return 'text-gray-400'
}

// ── Section editors ────────────────────────────────────────────────────────

function ClientInfoEditor({ content, onChange }: { content: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  const fields: [string, string, string][] = [
    ['name',         'Client Name',    'Sarah Chen'],
    ['company',      'Company',        'Nexus Tech'],
    ['email',        'Email',          'sarah@company.com'],
    ['phone',        'Phone',          '+1 555 000 0000'],
    ['projectStart', 'Project Start',  '2026-07-01'],
  ]
  return (
    <div className="grid grid-cols-2 gap-4">
      {fields.map(([key, label, placeholder]) => (
        <div key={key}>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</label>
          <input
            type="text"
            value={(content[key] as string) ?? ''}
            onChange={e => onChange({ ...content, [key]: e.target.value })}
            placeholder={placeholder}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
      ))}
      <div className="col-span-2">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Notes</label>
        <textarea
          rows={3}
          value={(content.notes as string) ?? ''}
          onChange={e => onChange({ ...content, notes: e.target.value })}
          placeholder="Any additional context about the client or project..."
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
        />
      </div>
    </div>
  )
}

function ScopeEditor({ content, onChange, industry }: { content: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void; industry?: IndustryType }) {
  const placeholder = industry
    ? INDUSTRY_CONFIG[industry].placeholders.scope
    : "Describe the scope of this project..."
  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Overview</label>
        <textarea
          rows={5}
          value={(content.description as string) ?? ''}
          onChange={e => onChange({ ...content, description: e.target.value })}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
        />
      </div>
    </div>
  )
}

function DeliverablesEditor({ content, onChange }: { content: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  const items: DeliverableItem[] = (content.items as DeliverableItem[]) ?? []

  function update(index: number, field: keyof DeliverableItem, value: string) {
    const updated = items.map((item, i) => i === index ? { ...item, [field]: value } : item)
    onChange({ ...content, items: updated })
  }

  function add() {
    onChange({ ...content, items: [...items, { title: '', description: '' }] })
  }

  function remove(index: number) {
    onChange({ ...content, items: items.filter((_, i) => i !== index) })
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((item, i) => (
        <div key={i} className="border border-gray-200 rounded-lg p-4 relative">
          <button onClick={() => remove(i)} className="absolute top-3 right-3 text-gray-300 hover:text-red-400 text-lg leading-none">×</button>
          <input
            type="text"
            value={item.title}
            onChange={e => update(i, 'title', e.target.value)}
            placeholder="Deliverable title"
            className="w-full font-medium text-sm text-gray-900 border-0 border-b border-gray-200 pb-2 mb-2 focus:outline-none focus:border-violet-400"
          />
          <textarea
            rows={2}
            value={item.description ?? ''}
            onChange={e => update(i, 'description', e.target.value)}
            placeholder="Description (optional)"
            className="w-full text-sm text-gray-600 focus:outline-none resize-none"
          />
        </div>
      ))}
      <button
        onClick={add}
        className="text-sm text-violet-600 hover:text-violet-700 font-semibold py-2 border-2 border-dashed border-violet-200 hover:border-violet-300 rounded-lg transition-colors"
      >
        + Add deliverable
      </button>
    </div>
  )
}

function PricingEditor({ content, onChange }: { content: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  const items: LineItem[] = (content.lineItems as LineItem[]) ?? []
  const discount = (content.discount as Discount | undefined) ?? null

  function updateItem(index: number, field: keyof LineItem, rawValue: string) {
    const updated = items.map((item, i) => {
      if (i !== index) return item
      const value = field === 'description' ? rawValue : parseFloat(rawValue) || 0
      const next = { ...item, [field]: value }
      if (field !== 'description') next.total = +(next.quantity * next.unitRate).toFixed(2)
      return next
    })
    onChange({ ...content, lineItems: updated })
  }

  function addItem() {
    onChange({ ...content, lineItems: [...items, { description: '', quantity: 1, unitRate: 0, total: 0 }] })
  }

  function removeItem(index: number) {
    onChange({ ...content, lineItems: items.filter((_, i) => i !== index) })
  }

  const subtotal = items.reduce((s, i) => s + i.total, 0)
  const discountAmt = discount?.amount ?? 0
  const total = subtotal - discountAmt

  const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <div>
      <table className="w-full text-sm mb-3">
        <thead>
          <tr className="border-b border-gray-200 text-xs font-semibold text-gray-400 uppercase tracking-wide">
            <th className="text-left pb-2 font-semibold" style={{width:'50%'}}>Description</th>
            <th className="text-right pb-2 font-semibold" style={{width:'10%'}}>Qty</th>
            <th className="text-right pb-2 font-semibold" style={{width:'15%'}}>Rate</th>
            <th className="text-right pb-2 font-semibold" style={{width:'20%'}}>Total</th>
            <th style={{width:'5%'}}></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i} className="border-b border-gray-100">
              <td className="py-2 pr-2">
                <input type="text" value={item.description} onChange={e => updateItem(i, 'description', e.target.value)}
                  placeholder="Item description"
                  className="w-full text-sm focus:outline-none focus:border-b focus:border-violet-400" />
              </td>
              <td className="py-2 px-1">
                <input type="number" value={item.quantity} min="0" onChange={e => updateItem(i, 'quantity', e.target.value)}
                  className="w-full text-right text-sm focus:outline-none focus:border-b focus:border-violet-400" />
              </td>
              <td className="py-2 px-1">
                <input type="number" value={item.unitRate} min="0" step="0.01" onChange={e => updateItem(i, 'unitRate', e.target.value)}
                  className="w-full text-right text-sm focus:outline-none focus:border-b focus:border-violet-400" />
              </td>
              <td className="py-2 pl-1 text-right text-sm text-gray-700 font-medium">${fmt(item.total)}</td>
              <td className="py-2 pl-1 text-center">
                <button onClick={() => removeItem(i)} className="text-gray-300 hover:text-red-400 text-base leading-none">×</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={addItem} className="text-xs text-violet-600 hover:text-violet-700 font-semibold mb-4">+ Add line item</button>

      <div className="flex flex-col items-end gap-1.5 text-sm">
        <div className="flex gap-8">
          <span className="text-gray-500">Subtotal</span>
          <span className="font-medium w-24 text-right">${fmt(subtotal)}</span>
        </div>

        {discount ? (
          <div className="flex gap-8 items-center">
            <input type="text" value={discount.label} onChange={e => onChange({ ...content, discount: { ...discount, label: e.target.value } })}
              className="text-sm text-gray-500 focus:outline-none w-24" />
            <div className="flex items-center gap-1">
              <span className="text-red-500">−</span>
              <input type="number" value={discount.amount} min="0" step="0.01"
                onChange={e => onChange({ ...content, discount: { ...discount, amount: parseFloat(e.target.value) || 0 } })}
                className="w-20 text-right text-sm text-red-500 focus:outline-none border-b border-gray-200 focus:border-red-400" />
              <button onClick={() => onChange({ ...content, discount: null })} className="text-gray-300 hover:text-red-400 text-xs ml-1">×</button>
            </div>
          </div>
        ) : (
          <button onClick={() => onChange({ ...content, discount: { label: 'Discount', amount: 0 } })}
            className="text-xs text-gray-400 hover:text-violet-600 font-medium">
            + Add discount
          </button>
        )}

        <div className="border-t border-gray-200 pt-1.5 flex gap-8 w-full justify-end">
          <span className="font-bold text-violet-700 uppercase tracking-wide text-xs">Total</span>
          <span className="font-bold text-violet-700 text-base w-24 text-right">${fmt(total)}</span>
        </div>
      </div>
    </div>
  )
}

function TermsEditor({ content, onChange }: { content: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  return (
    <textarea
      rows={12}
      value={(content.text as string) ?? ''}
      onChange={e => onChange({ ...content, text: e.target.value })}
      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none text-gray-600"
    />
  )
}

function SectionEditorInner({ section, onSave, industry }: { section: Section; onSave: (id: string, content: Record<string, unknown>) => void; industry?: IndustryType }) {
  const [content, setContent] = useState<Record<string, unknown>>(section.content as Record<string, unknown>)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isFirstRender = useRef(true)

  // Reset when active section changes
  useEffect(() => {
    setContent(section.content as Record<string, unknown>)
    isFirstRender.current = true
  }, [section.id])

  const handleChange = useCallback((next: Record<string, unknown>) => {
    setContent(next)
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => onSave(section.id, next), 800)
  }, [section.id, onSave])

  useEffect(() => () => { if (saveTimer.current) clearTimeout(saveTimer.current) }, [])

  const editorProps = { content, onChange: handleChange }

  return (
    <div>
      {section.type === 'client-info'   && <ClientInfoEditor    {...editorProps} />}
      {section.type === 'scope'         && <ScopeEditor          {...editorProps} industry={industry} />}
      {section.type === 'deliverables'  && <DeliverablesEditor   {...editorProps} />}
      {section.type === 'pricing'       && <PricingEditor        {...editorProps} />}
      {section.type === 'terms'         && <TermsEditor          {...editorProps} />}
      {section.type === 'custom'        && <ScopeEditor          {...editorProps} industry={industry} />}
    </div>
  )
}

// ── Read-only section view ────────────────────────────────────────────────

function SectionReadonlyView({ section }: { section: Section }) {
  const content = section.content as Record<string, unknown>
  const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  if (section.type === 'client-info') {
    const fields: [string, string][] = [
      ['name', 'Client Name'], ['company', 'Company'], ['email', 'Email'],
      ['phone', 'Phone'], ['projectStart', 'Project Start'],
    ]
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.filter(([key]) => content[key]).map(([key, label]) => (
          <div key={key}>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</p>
            <p className="text-sm text-gray-900">{content[key] as string}</p>
          </div>
        ))}
        {typeof content.notes === 'string' && content.notes && (
          <div className="col-span-full">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Notes</p>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{content.notes}</p>
          </div>
        )}
      </div>
    )
  }

  if (section.type === 'scope' || section.type === 'custom') {
    return <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{(content.description as string) ?? ''}</p>
  }

  if (section.type === 'deliverables') {
    const items: DeliverableItem[] = (content.items as DeliverableItem[]) ?? []
    if (!items.length) return <p className="text-sm text-gray-400">No deliverables listed.</p>
    return (
      <div className="flex flex-col gap-3">
        {items.map((item, i) => (
          <div key={i} className="border border-gray-100 rounded-lg p-4">
            <p className="font-semibold text-sm text-gray-900">{item.title}</p>
            {item.description && <p className="text-sm text-gray-600 mt-1">{item.description}</p>}
          </div>
        ))}
      </div>
    )
  }

  if (section.type === 'pricing') {
    const items: LineItem[] = (content.lineItems as LineItem[]) ?? []
    const discount = (content.discount as Discount | undefined) ?? null
    const subtotal = items.reduce((s, i) => s + i.total, 0)
    const discountAmt = discount?.amount ?? 0
    const total = subtotal - discountAmt
    return (
      <div>
        <table className="w-full text-sm mb-3">
          <thead>
            <tr className="border-b border-gray-200 text-xs font-semibold text-gray-400 uppercase tracking-wide">
              <th className="text-left pb-2" style={{width:'55%'}}>Description</th>
              <th className="text-right pb-2" style={{width:'10%'}}>Qty</th>
              <th className="text-right pb-2" style={{width:'15%'}}>Rate</th>
              <th className="text-right pb-2" style={{width:'20%'}}>Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="py-2 pr-2 text-gray-700">{item.description}</td>
                <td className="py-2 px-1 text-right text-gray-600">{item.quantity}</td>
                <td className="py-2 px-1 text-right text-gray-600">${fmt(item.unitRate)}</td>
                <td className="py-2 pl-1 text-right font-medium">${fmt(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex flex-col items-end gap-1.5 text-sm">
          <div className="flex gap-8">
            <span className="text-gray-500">Subtotal</span>
            <span className="font-medium w-24 text-right">${fmt(subtotal)}</span>
          </div>
          {discount && (
            <div className="flex gap-8">
              <span className="text-red-500">{discount.label}</span>
              <span className="text-red-500 w-24 text-right">−${fmt(discountAmt)}</span>
            </div>
          )}
          <div className="border-t border-gray-200 pt-1.5 flex gap-8 w-full justify-end">
            <span className="font-bold text-violet-700 uppercase tracking-wide text-xs">Total</span>
            <span className="font-bold text-violet-700 text-base w-24 text-right">${fmt(total)}</span>
          </div>
        </div>
      </div>
    )
  }

  if (section.type === 'terms') {
    return <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{(content.text as string) ?? ''}</p>
  }

  return null
}

// ── Main editor ────────────────────────────────────────────────────────────

export default function ProposalEditor({ initialProposal }: { initialProposal: Proposal }) {
  const router = useRouter()
  const [proposal, setProposal] = useState(initialProposal)
  const [activeSectionId, setActiveSectionId] = useState(initialProposal.sections[0]?.id ?? '')
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [isFinalizingFlow, setIsFinalizingFlow] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [finalizeError, setFinalizeError] = useState('')

  const sections = [...proposal.sections].sort((a, b) => a.orderIndex - b.orderIndex)
  const activeSection = sections.find(s => s.id === activeSectionId)

  const completedCount = sections.filter(s => s.complete).length
  const completionPct = sections.length ? Math.round((completedCount / sections.length) * 100) : 0

  const canFinalize = ['client-info', 'scope', 'pricing'].every(type =>
    sections.find(s => s.type === type)?.complete
  )

  const saveSection = useCallback(async (sectionId: string, content: Record<string, unknown>) => {
    setIsSaving(true)
    setSaveError('')
    try {
      const res = await fetch(`/api/proposals/${proposal.id}/sections/${sectionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      if (!res.ok) throw new Error('Save failed')
      const updated: Proposal = await res.json()
      setProposal(updated)
    } catch {
      setSaveError('Auto-save failed — check your connection')
    } finally {
      setIsSaving(false)
    }
  }, [proposal.id])

  async function markComplete(sectionId: string, complete: boolean) {
    const res = await fetch(`/api/proposals/${proposal.id}/sections/${sectionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ complete }),
    })
    if (res.ok) setProposal(await res.json())
  }

  async function handleFinalize() {
    setFinalizeError('')
    const res = await fetch(`/api/proposals/${proposal.id}/finalize`, { method: 'POST' })
    if (!res.ok) {
      const data = await res.json()
      setFinalizeError(data.error ?? 'Finalize failed')
      return
    }
    const finalized: Proposal = await res.json()
    setProposal(finalized)

    // Get share link
    const shareRes = await fetch(`/api/proposals/${proposal.id}/share`, { method: 'POST' })
    if (shareRes.ok) {
      const { url } = await shareRes.json()
      setShareUrl(url)
    }
    setIsFinalizingFlow(false)
  }

  async function handleRevise() {
    const res = await fetch(`/api/proposals/${proposal.id}/revise`, { method: 'POST' })
    if (res.ok) {
      const revision: Proposal = await res.json()
      router.push(`/proposals/${revision.id}`)
    }
  }

  const isReadOnly = proposal.status !== 'draft'
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isFinalizingFlow) return
    const el = modalRef.current
    if (!el) return
    const focusable = el.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    focusable[0]?.focus()
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { setIsFinalizingFlow(false); return }
      if (e.key !== 'Tab' || focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus() }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isFinalizingFlow])

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* Sidebar */}
      <aside className="w-60 shrink-0 bg-white border-r border-gray-200 flex flex-col">
        <div className="px-4 py-4 border-b border-gray-100">
          <Link href="/dashboard" className="text-xs text-gray-400 hover:text-gray-600">← Proposals</Link>
          <p className="font-semibold text-gray-900 text-sm mt-1 truncate">{proposal.title}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_BADGE[proposal.status]}`}>
              {proposal.status === 'finalized' ? 'Sent' : proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
            </span>
            <span className={`text-xs font-medium ${completionColor(completionPct)}`}>{completionPct}%</span>
          </div>
        </div>

        <nav className="flex-1 py-2 overflow-y-auto">
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSectionId(s.id)}
              className={`w-full text-left px-4 py-2.5 flex items-center gap-3 text-sm transition-colors ${activeSectionId === s.id ? 'bg-violet-50 text-violet-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <span className={`shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center text-xs ${s.complete ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'}`}>
                {s.complete && '✓'}
              </span>
              <span className="truncate">{s.title}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          {isSaving && <p className="text-xs text-gray-400 mb-2">Saving…</p>}
          {saveError && <p className="text-xs text-red-500 mb-2">{saveError}</p>}

          {proposal.status === 'draft' && (
            <button
              onClick={() => setIsFinalizingFlow(true)}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
            >
              Send Proposal
            </button>
          )}

          {proposal.status === 'finalized' && shareUrl && (
            <div>
              <p className="text-xs text-gray-500 mb-1 font-medium">Share link</p>
              <div className="flex items-center gap-1">
                <input readOnly value={shareUrl} className="flex-1 text-xs bg-gray-50 border border-gray-200 rounded px-2 py-1 text-gray-600" />
                <button onClick={() => navigator.clipboard.writeText(shareUrl)} className="text-xs text-violet-600 font-semibold hover:text-violet-700 px-1">Copy</button>
              </div>
              <button onClick={handleRevise} className="mt-2 w-full text-sm text-gray-600 hover:text-gray-900 font-medium py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                Create Revision
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {activeSection ? (
          <div className="max-w-2xl mx-auto px-6 py-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{activeSection.title}</h2>
                {isReadOnly && <p className="text-xs text-amber-600 mt-0.5">This proposal is {proposal.status} — read only</p>}
              </div>
              {!isReadOnly && (
                <button
                  onClick={() => markComplete(activeSection.id, !activeSection.complete)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${activeSection.complete ? 'bg-green-50 border-green-200 text-green-700' : 'border-gray-200 text-gray-500 hover:border-green-300 hover:text-green-600'}`}
                >
                  {activeSection.complete ? '✓ Complete' : 'Mark complete'}
                </button>
              )}
            </div>

            {isReadOnly ? (
              <SectionReadonlyView section={activeSection} />
            ) : (
              <SectionEditorInner key={activeSection.id} section={activeSection} onSave={saveSection} industry={proposal.industry as IndustryType} />
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            Select a section from the sidebar
          </div>
        )}
      </main>

      {/* Finalize modal */}
      {isFinalizingFlow && (
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="finalize-dialog-title"
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h3 id="finalize-dialog-title" className="text-lg font-bold text-gray-900 mb-2">Send this proposal?</h3>
            <p className="text-sm text-gray-600 mb-4">
              This locks the current version. You can still create a revision afterward.
            </p>

            {!canFinalize && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                <p className="text-sm font-medium text-amber-800 mb-1">Required sections not complete:</p>
                <ul className="text-sm text-amber-700 list-disc list-inside">
                  {['client-info', 'scope', 'pricing'].filter(type => !sections.find(s => s.type === type)?.complete).map(type => (
                    <li key={type}>{type === 'client-info' ? 'Client Information' : type.charAt(0).toUpperCase() + type.slice(1)}</li>
                  ))}
                </ul>
              </div>
            )}

            {finalizeError && <p className="text-sm text-red-600 mb-3">{finalizeError}</p>}

            <div className="flex gap-3">
              <button onClick={() => setIsFinalizingFlow(false)} className="flex-1 border border-gray-200 text-gray-700 font-semibold py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleFinalize}
                disabled={!canFinalize}
                className="flex-[2] bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white font-semibold py-2.5 rounded-lg transition-colors"
              >
                Send &amp; Generate PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
