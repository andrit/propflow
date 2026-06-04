'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type ProposalType = 'cold' | 'warm' | 'retainer'
type TemplateType = 'clean' | 'executive'

const TYPES: { value: ProposalType; label: string; desc: string }[] = [
  { value: 'cold',     label: 'New Client',  desc: 'First proposal to someone you haven\'t worked with before.' },
  { value: 'warm',     label: 'Return Client', desc: 'You\'ve worked together before — pre-fills where possible.' },
  { value: 'retainer', label: 'Retainer',    desc: 'Ongoing engagement with recurring pricing.' },
]

const TEMPLATES: { value: TemplateType; label: string; desc: string; preview: string }[] = [
  {
    value: 'clean', label: 'Clean',
    desc: 'Modern and minimal. Left accent stripe, clean typography. Great for creative and tech clients.',
    preview: 'contemporary',
  },
  {
    value: 'executive', label: 'Executive',
    desc: 'Bold color band cover, section badges, serif headings. Ideal for agencies and retainer agreements.',
    preview: 'institutional',
  },
]

type Step = 'type' | 'details' | 'template'

export default function NewProposalPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('type')
  const [proposalType, setProposalType] = useState<ProposalType>('cold')
  const [template, setTemplate] = useState<TemplateType>('clean')
  const [title, setTitle] = useState('')
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [clientCompany, setClientCompany] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleCreate() {
    if (!title.trim() || !clientName.trim() || !clientEmail.trim()) {
      setError('Title, client name, and email are required.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          client: {
            name:    clientName.trim(),
            email:   clientEmail.trim(),
            company: clientCompany.trim() || undefined,
          },
          proposalType,
          template,
          currency: currency.trim() || 'USD',
        }),
      })
      if (res.status === 403) {
        const data = await res.json()
        setError(data.error ?? 'You\'ve reached the free tier limit. Upgrade to Pro for unlimited proposals.')
        setLoading(false)
        return
      }
      if (!res.ok) throw new Error('Failed to create')
      const proposal = await res.json()
      router.push(`/proposals/${proposal.id}`)
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900">← Dashboard</Link>
        <p className="text-sm font-semibold text-gray-700">New Proposal</p>
        <div className="w-20" />
      </div>

      {/* Step indicator */}
      <div className="flex justify-center gap-2 pt-8 pb-2">
        {(['type', 'details', 'template'] as Step[]).map((s, i) => (
          <div key={s} className={`h-1.5 w-10 rounded-full transition-colors ${step === s ? 'bg-violet-600' : i < ['type','details','template'].indexOf(step) ? 'bg-violet-300' : 'bg-gray-200'}`} />
        ))}
      </div>

      <div className="flex-1 flex items-start justify-center pt-6 px-4 pb-16">
        <div className="w-full max-w-lg">

          {/* Step 1: Type */}
          {step === 'type' && (
            <div>
              <h1 className="text-xl font-bold text-gray-900 mb-1">What kind of proposal?</h1>
              <p className="text-sm text-gray-500 mb-6">This affects default section prompts and pre-fill behavior.</p>
              <div className="flex flex-col gap-3">
                {TYPES.map(t => (
                  <button
                    key={t.value}
                    onClick={() => setProposalType(t.value)}
                    className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all ${proposalType === t.value ? 'border-violet-600 bg-violet-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                  >
                    <p className={`font-semibold ${proposalType === t.value ? 'text-violet-700' : 'text-gray-900'}`}>{t.label}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{t.desc}</p>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setStep('details')}
                className="mt-6 w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Continue
              </button>
            </div>
          )}

          {/* Step 2: Details */}
          {step === 'details' && (
            <div>
              <h1 className="text-xl font-bold text-gray-900 mb-1">Proposal details</h1>
              <p className="text-sm text-gray-500 mb-6">You can edit all of this in the editor.</p>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Proposal title <span className="text-red-500">*</span></label>
                  <input
                    type="text" value={title} onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Brand Identity Redesign"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Client name <span className="text-red-500">*</span></label>
                    <input
                      type="text" value={clientName} onChange={e => setClientName(e.target.value)}
                      placeholder="Sarah Chen"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Client email <span className="text-red-500">*</span></label>
                    <input
                      type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)}
                      placeholder="sarah@company.com"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company <span className="text-gray-400 font-normal">(optional)</span></label>
                    <input
                      type="text" value={clientCompany} onChange={e => setClientCompany(e.target.value)}
                      placeholder="Nexus Tech"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                    <input
                      type="text" value={currency} onChange={e => setCurrency(e.target.value)}
                      placeholder="USD"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                </div>
              </div>
              {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep('type')} className="flex-1 border border-gray-300 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-50 transition-colors">
                  Back
                </button>
                <button
                  onClick={() => {
                    if (!title.trim() || !clientName.trim() || !clientEmail.trim()) {
                      setError('Title, client name, and email are required.')
                    } else {
                      setError('')
                      setStep('template')
                    }
                  }}
                  className="flex-[2] bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Template */}
          {step === 'template' && (
            <div>
              <h1 className="text-xl font-bold text-gray-900 mb-1">Choose a template</h1>
              <p className="text-sm text-gray-500 mb-6">Both use your brand colors on Pro. You can switch later.</p>
              <div className="flex flex-col gap-3">
                {TEMPLATES.map(t => (
                  <button
                    key={t.value}
                    onClick={() => setTemplate(t.value)}
                    className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all ${template === t.value ? 'border-violet-600 bg-violet-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                  >
                    <div className="flex items-center justify-between">
                      <p className={`font-semibold ${template === t.value ? 'text-violet-700' : 'text-gray-900'}`}>{t.label}</p>
                      <span className="text-xs text-gray-400 font-medium capitalize">{t.preview}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{t.desc}</p>
                  </button>
                ))}
              </div>
              {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep('details')} className="flex-1 border border-gray-300 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-50 transition-colors">
                  Back
                </button>
                <button
                  onClick={handleCreate}
                  disabled={loading}
                  className="flex-[2] bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  {loading ? 'Creating…' : 'Create Proposal'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </main>
  )
}
