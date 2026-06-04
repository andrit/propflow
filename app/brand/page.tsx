'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type Brand = {
  primaryColor: string
  accentColor: string
  font: 'inter' | 'merriweather' | 'playfair'
  coverQuote: string | null
  coverQuoteAttribution: string | null
}

const FONTS = [
  { value: 'inter',       label: 'Inter',             desc: 'Clean, modern. Good for most proposals.' },
  { value: 'merriweather', label: 'Merriweather',     desc: 'Readable serif. Great for long-form content.' },
  { value: 'playfair',    label: 'Playfair Display',  desc: 'Elegant serif. Best with Executive template.' },
] as const

export default function BrandPage() {
  const [brand, setBrand] = useState<Brand>({
    primaryColor: '#4f46e5',
    accentColor:  '#818cf8',
    font:          'inter',
    coverQuote:    null,
    coverQuoteAttribution: null,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const [error, setError]     = useState('')
  const [proRequired, setProRequired] = useState(false)

  useEffect(() => {
    fetch('/api/brand')
      .then(r => r.json())
      .then(data => {
        if (data) setBrand({
          primaryColor:          data.primaryColor ?? '#4f46e5',
          accentColor:           data.accentColor  ?? '#818cf8',
          font:                  data.font         ?? 'inter',
          coverQuote:            data.coverQuote   ?? '',
          coverQuoteAttribution: data.coverQuoteAttribution ?? '',
        })
      })
      .finally(() => setLoading(false))
  }, [])

  async function handleSave() {
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      const res = await fetch('/api/brand', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          primaryColor:          brand.primaryColor,
          accentColor:           brand.accentColor,
          font:                  brand.font,
          coverQuote:            brand.coverQuote || null,
          coverQuoteAttribution: brand.coverQuoteAttribution || null,
        }),
      })
      if (res.status === 403) {
        setProRequired(true)
        return
      }
      if (!res.ok) throw new Error('Save failed')
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      setError('Failed to save brand settings.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400 text-sm">Loading…</p>
    </main>
  )

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/dashboard" className="text-sm text-gray-400 hover:text-gray-700">← Dashboard</Link>
            <h1 className="text-2xl font-bold text-gray-900 mt-1">Brand Settings</h1>
            <p className="text-sm text-gray-500 mt-0.5">Applied to all your PDF proposals.</p>
          </div>
        </div>

        {proRequired && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm font-medium text-amber-800">Custom branding is a Pro feature.</p>
            <p className="text-sm text-amber-700 mt-0.5">Upgrade to Pro to apply your colors and logo to proposals.</p>
            <Link href="/pricing" className="mt-3 inline-block bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
              Upgrade to Pro
            </Link>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-6">
          {/* Colors */}
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Brand Colors</h2>
            <p className="text-xs text-gray-400 mb-4">Pro feature. Free tier uses propflow default indigo.</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Primary color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={brand.primaryColor} onChange={e => setBrand(b => ({ ...b, primaryColor: e.target.value }))}
                    className="w-10 h-10 rounded cursor-pointer border-0 p-0" />
                  <input type="text" value={brand.primaryColor} onChange={e => setBrand(b => ({ ...b, primaryColor: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Accent color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={brand.accentColor} onChange={e => setBrand(b => ({ ...b, accentColor: e.target.value }))}
                    className="w-10 h-10 rounded cursor-pointer border-0 p-0" />
                  <input type="text" value={brand.accentColor} onChange={e => setBrand(b => ({ ...b, accentColor: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-500" />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100" />

          {/* Font */}
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Proposal Font</h2>
            <div className="flex flex-col gap-2">
              {FONTS.map(f => (
                <button key={f.value} onClick={() => setBrand(b => ({ ...b, font: f.value }))}
                  className={`text-left px-4 py-3 rounded-lg border-2 transition-all ${brand.font === f.value ? 'border-violet-600 bg-violet-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <span className={`font-semibold text-sm ${brand.font === f.value ? 'text-violet-700' : 'text-gray-800'}`}>{f.label}</span>
                  <span className="text-xs text-gray-400 ml-2">{f.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100" />

          {/* Cover quote */}
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-1">Cover Quote</h2>
            <p className="text-xs text-gray-400 mb-3">Appears on the Executive template cover. Leave blank to use the propflow default.</p>
            <textarea
              rows={3}
              value={brand.coverQuote ?? ''}
              onChange={e => setBrand(b => ({ ...b, coverQuote: e.target.value }))}
              placeholder='"Your work is going to fill a large part of your life…"'
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
            />
            <input
              type="text"
              value={brand.coverQuoteAttribution ?? ''}
              onChange={e => setBrand(b => ({ ...b, coverQuoteAttribution: e.target.value }))}
              placeholder="Attribution (e.g. Steve Jobs)"
              className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <div className="mt-6 flex gap-3">
          <Link href="/dashboard" className="flex-1 text-center border border-gray-200 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-50 transition-colors text-sm">
            Cancel
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-[2] bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition-colors text-sm"
          >
            {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Brand Settings'}
          </button>
        </div>
      </div>
    </main>
  )
}
