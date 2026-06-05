'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Period = 'monthly' | 'annual'

const PLANS = [
  {
    id:        'free' as const,
    name:      'Free',
    monthly:   0,
    annual:    0,
    desc:      'Try it out',
    features:  ['1 proposal / month', 'Default templates only', 'propflow default branding', 'Public share link'],
    cta:       'Get started free',
    highlight: false,
  },
  {
    id:        'pro' as const,
    name:      'Pro',
    monthly:   9,
    annual:    79,
    desc:      'For active freelancers',
    features:  ['Unlimited proposals', 'Custom brand colors & logo', '5 saved templates', 'Clean & Executive templates', 'PDF download'],
    cta:       'Upgrade to Pro',
    highlight: true,
  },
  {
    id:        'teams' as const,
    name:      'Teams',
    monthly:   19,
    annual:    159,
    desc:      'For small agencies',
    features:  ['Everything in Pro', '3 team seats', 'Shared templates', 'Team brand settings'],
    cta:       'Upgrade to Teams',
    highlight: false,
  },
] as const

export default function PricingPage() {
  const [period, setPeriod]   = useState<Period>('monthly')
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError]     = useState('')
  const router = useRouter()

  async function handleUpgrade(plan: 'pro' | 'teams') {
    setLoading(plan)
    setError('')
    try {
      const res = await fetch('/api/checkout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ plan, period }),
      })
      if (res.status === 401) {
        router.push('/sign-in')
        return
      }
      if (!res.ok) throw new Error('Could not start checkout')
      const { url } = await res.json()
      window.location.href = url
    } catch {
      setError('Failed to start checkout. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-16 sm:py-24">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-700 mb-6 block">← Back</Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Simple, honest pricing</h1>
          <p className="text-gray-500 text-lg">No hidden fees. Cancel anytime.</p>

          {/* Period toggle */}
          <div className="inline-flex items-center mt-8 bg-white border border-gray-200 rounded-full p-1 gap-1">
            <button
              onClick={() => setPeriod('monthly')}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${period === 'monthly' ? 'bg-violet-600 text-white shadow' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setPeriod('annual')}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${period === 'annual' ? 'bg-violet-600 text-white shadow' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Annual
              <span className="ml-1.5 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-semibold">-30%</span>
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map(plan => {
            const price = period === 'annual' ? plan.annual : plan.monthly
            const monthlyEquiv = plan.id !== 'free' && period === 'annual'
              ? plan.id === 'pro' ? 6.58 : 13.25
              : null

            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl p-6 flex flex-col gap-5 ${
                  plan.highlight
                    ? 'border-2 border-violet-600 shadow-lg shadow-violet-100'
                    : 'border border-gray-200'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-violet-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Most popular</span>
                  </div>
                )}

                <div>
                  <h2 className="text-lg font-bold text-gray-900">{plan.name}</h2>
                  <p className="text-sm text-gray-500 mt-0.5">{plan.desc}</p>
                </div>

                <div>
                  {plan.id === 'free' ? (
                    <p className="text-4xl font-bold text-gray-900">Free</p>
                  ) : (
                    <div>
                      <p className="text-4xl font-bold text-gray-900">
                        ${period === 'annual' ? plan.annual : price}
                        <span className="text-base font-normal text-gray-400">
                          {period === 'annual' ? '/yr' : '/mo'}
                        </span>
                      </p>
                      {monthlyEquiv && (
                        <p className="text-sm text-gray-400 mt-1">${monthlyEquiv}/mo billed annually</p>
                      )}
                    </div>
                  )}
                </div>

                <ul className="flex flex-col gap-2.5 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-gray-700">
                      <svg className="w-4 h-4 text-violet-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>

                {plan.id === 'free' ? (
                  <Link
                    href="/sign-up"
                    className="block text-center border border-gray-200 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    {plan.cta}
                  </Link>
                ) : (
                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={!!loading}
                    className={`w-full font-semibold py-3 rounded-lg transition-colors text-sm disabled:opacity-60 ${
                      plan.highlight
                        ? 'bg-violet-600 hover:bg-violet-700 text-white'
                        : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {loading === plan.id ? 'Redirecting…' : plan.cta}
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {error && <p className="text-center text-sm text-red-600 mt-6">{error}</p>}

        {/* FAQ */}
        <div className="mt-20 max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-8 text-center">Frequently asked questions</h2>
          <div className="flex flex-col gap-6">
            {[
              ['Can I cancel anytime?', 'Yes. Cancel from your account settings and you keep Pro access until the end of your billing period.'],
              ['What happens when I hit the free limit?', 'You can still view and share existing proposals. To create a new one, upgrade to Pro or wait until the next calendar month.'],
              ['Is my client data private?', 'Yes. Proposals are accessible only to you and people you share the link with. We don\'t sell or expose your data.'],
              ['Do I need a credit card for Free?', 'No. Sign up with your email and start creating immediately. No card required.'],
            ].map(([q, a]) => (
              <div key={q as string}>
                <p className="font-semibold text-gray-900 mb-1">{q}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
