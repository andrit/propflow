'use client'

import Link from 'next/link'
import { useState } from 'react'

// ── Static data ──────────────────────────────────────────────────────────────

const HOW_IT_WORKS = [
  {
    step: '1',
    title: 'Fill the wizard',
    desc:  'Enter your client info, scope, deliverables, and pricing. Takes about 5 minutes.',
  },
  {
    step: '2',
    title: 'Pick your template',
    desc:  'Choose Clean for modern minimalism or Executive for high-end clients. Customize colors and logo.',
  },
  {
    step: '3',
    title: 'Send and win',
    desc:  'Share a live link or download a pixel-perfect PDF. Track when clients view it.',
  },
]

const FEATURES = [
  { icon: '📄', title: 'Pixel-perfect PDFs',     desc: 'Browser-rendered via Puppeteer. Prints exactly as designed, every time.' },
  { icon: '🎨', title: 'Custom branding',         desc: 'Your logo, colors, and font — applied to every proposal automatically.' },
  { icon: '🔗', title: 'Live share links',        desc: 'Send a URL instead of an attachment. Update the proposal after sending.' },
  { icon: '📋', title: 'Reusable templates',      desc: 'Save your best proposal structure and reuse it for similar clients.' },
  { icon: '💰', title: 'Smart pricing tables',    desc: 'Line items, quantity × rate, discount toggle, and currency selection.' },
  { icon: '📝', title: 'Built-in terms',          desc: 'Default freelance terms pre-loaded. Edit once, reuse forever.' },
  { icon: '🔄', title: 'Revision tracking',       desc: 'Create a new version while the original link stays valid.' },
  { icon: '⏰', title: 'Expiry dates',            desc: 'Add urgency with a valid-until date shown on the cover page.' },
]

const PRICING_TIERS = [
  {
    name:      'Free',
    price:     0,
    period:    '',
    highlight: false,
    features:  ['1 proposal / month', 'Default templates', 'propflow branding', 'Public share link'],
    cta:       'Get started free',
    href:      '/sign-up',
  },
  {
    name:      'Pro',
    price:     9,
    period:    '/mo',
    highlight: true,
    features:  ['Unlimited proposals', 'Custom branding + logo', '5 saved templates', 'Clean & Executive templates', 'PDF download'],
    cta:       'Start Pro',
    href:      '/sign-up',
  },
  {
    name:      'Teams',
    price:     19,
    period:    '/mo',
    highlight: false,
    features:  ['Everything in Pro', '3 team seats', 'Shared templates', 'Team brand settings'],
    cta:       'Start Teams',
    href:      '/sign-up',
  },
]

const FAQS = [
  {
    q: 'Do you store my client data?',
    a: 'Yes, but only to power your proposals. Your data is private — clients can only access proposals you explicitly share with them via a unique link. We never sell or expose your data.',
  },
  {
    q: 'What happens when I hit the free proposal limit?',
    a: 'You can still view, edit, and share existing proposals. To create a new one, upgrade to Pro or wait until the next calendar month.',
  },
  {
    q: 'Can I use my own logo and colors?',
    a: 'Yes — on the Pro and Teams plans. Upload your logo, pick your brand colors, and they\'re applied automatically to every proposal you create.',
  },
  {
    q: 'Can I cancel my subscription anytime?',
    a: 'Yes. Cancel from your billing settings and you keep Pro access until the end of your current billing period. No questions asked.',
  },
  {
    q: 'Do I need a credit card for the free plan?',
    a: 'No. Sign up with your email and start creating immediately. A card is only needed when you upgrade to Pro or Teams.',
  },
]

// ── Proposal mockup (pure CSS, no images) ───────────────────────────────────

function ProposalMockup() {
  return (
    <div className="mt-14 mx-auto max-w-2xl rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-indigo-100 overflow-hidden">
      {/* Cover */}
      <div className="flex">
        <div className="w-1.5 bg-indigo-600 shrink-0" />
        <div className="flex-1 px-6 py-5 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">P</div>
              <div className="h-2 w-20 rounded bg-gray-200" />
            </div>
            <div className="h-2 w-12 rounded bg-indigo-100" />
          </div>
          <div className="h-4 w-48 rounded bg-gray-800 mb-1.5" />
          <div className="h-3 w-32 rounded bg-gray-300" />
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="h-2 w-16 rounded bg-gray-300 mb-1.5" />
              <div className="h-2.5 w-24 rounded bg-gray-600" />
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="h-2 w-10 rounded bg-gray-300 mb-1.5" />
              <div className="h-2.5 w-20 rounded bg-gray-600" />
            </div>
          </div>
        </div>
      </div>
      {/* Section row */}
      <div className="flex">
        <div className="w-1.5 bg-indigo-600 shrink-0" />
        <div className="flex-1 px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
            <div className="h-2.5 w-20 rounded bg-gray-700" />
          </div>
          <div className="space-y-1.5">
            <div className="flex gap-2 items-center">
              <div className="w-5 h-5 rounded-full bg-indigo-600 shrink-0" />
              <div className="h-2 flex-1 rounded bg-gray-200" />
            </div>
            <div className="flex gap-2 items-center">
              <div className="w-5 h-5 rounded-full bg-indigo-600 shrink-0" />
              <div className="h-2 w-4/5 rounded bg-gray-200" />
            </div>
            <div className="flex gap-2 items-center">
              <div className="w-5 h-5 rounded-full bg-indigo-600 shrink-0" />
              <div className="h-2 w-3/5 rounded bg-gray-200" />
            </div>
          </div>
        </div>
      </div>
      {/* Pricing row */}
      <div className="flex">
        <div className="w-1.5 bg-indigo-600 shrink-0" />
        <div className="flex-1 px-6 py-4">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
            <div className="h-2.5 w-16 rounded bg-gray-700" />
          </div>
          <div className="space-y-2">
            {[['Website redesign', '$4,500'], ['Monthly retainer', '$1,200'], ['Brand kit', '$800']].map(([label, price]) => (
              <div key={label} className="flex justify-between items-center border-b border-gray-100 pb-1.5">
                <div className="h-2 w-32 rounded bg-gray-300" />
                <div className="h-2.5 w-12 rounded bg-gray-500" />
              </div>
            ))}
            <div className="flex justify-between items-center pt-1">
              <div className="h-3 w-10 rounded bg-indigo-200" />
              <div className="h-3.5 w-16 rounded bg-indigo-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased">

      {/* ── Sticky nav ── */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <span className="text-lg sm:text-xl font-bold text-indigo-600">propflow</span>
          <nav className="hidden md:flex gap-8 text-sm text-gray-500">
            <a href="#how-it-works" className="hover:text-gray-900 transition-colors">How it works</a>
            <a href="#features"     className="hover:text-gray-900 transition-colors">Features</a>
            <a href="#pricing"      className="hover:text-gray-900 transition-colors">Pricing</a>
            <a href="#faq"          className="hover:text-gray-900 transition-colors">FAQ</a>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/sign-in" className="text-sm text-gray-500 hover:text-gray-900 transition-colors hidden sm:block">
              Sign in
            </Link>
            <Link href="/sign-up" className="rounded-lg bg-indigo-600 px-3 sm:px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors">
              Get started free
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-16 sm:pt-20 pb-12 sm:pb-20 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 border border-indigo-100 px-4 py-1.5 text-sm text-indigo-700 mb-8">
          <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
          Free to try — no credit card required
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05] mb-6">
          Win clients with proposals<br />
          <span className="text-indigo-600">they&apos;ll remember</span>
        </h1>

        <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          Fill in the wizard, pick your template, send a link or PDF. Professional, branded proposals in under 5 minutes.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8">
          <Link
            href="/sign-up"
            className="w-full sm:w-auto rounded-xl bg-indigo-600 px-8 py-4 text-base font-semibold text-white hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/25"
          >
            Start for free →
          </Link>
          <a
            href="#how-it-works"
            className="w-full sm:w-auto rounded-xl border border-gray-200 px-8 py-4 text-base font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            See how it works
          </a>
        </div>

        <p className="text-sm text-gray-400">No card needed · Ready in 5 minutes · Your data stays private</p>

        <ProposalMockup />
      </section>

      {/* ── Platform bar ── */}
      <div className="border-y border-gray-100 bg-gray-50/60 py-5 overflow-x-auto">
        <div className="mx-auto max-w-6xl px-6 flex items-center justify-center gap-8 sm:gap-12 text-sm text-gray-400 whitespace-nowrap">
          <span className="font-semibold text-gray-500 shrink-0">Works great for</span>
          {['Freelance developers', 'Designers', 'Copywriters', 'Consultants', 'Agencies', 'Solopreneurs'].map(s => (
            <span key={s} className="shrink-0">{s}</span>
          ))}
        </div>
      </div>

      {/* ── How it works ── */}
      <section id="how-it-works" className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">How it works</h2>
          <p className="text-gray-500 mt-2">Three steps from blank to sent</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {HOW_IT_WORKS.map(({ step, title, desc }) => (
            <div key={step} className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white text-xl font-bold flex items-center justify-center mx-auto mb-4">
                {step}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="bg-gray-50/60 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Everything you need to look professional</h2>
            <p className="text-gray-500 mt-2">No Word templates. No back-and-forth on email chains.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map(({ icon, title, desc }) => (
              <div key={title} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="text-2xl mb-3">{icon}</div>
                <h3 className="font-semibold text-gray-900 mb-1.5 text-sm">{title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Simple pricing</h2>
          <p className="text-gray-500 mt-2">
            Start free. Upgrade when you&apos;re winning.{' '}
            <Link href="/pricing" className="text-indigo-600 hover:underline">Full pricing →</Link>
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PRICING_TIERS.map(({ name, price, period, highlight, features, cta, href }) => (
            <div
              key={name}
              className={`relative rounded-2xl p-6 flex flex-col gap-5 ${
                highlight
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200'
                  : 'bg-white border border-gray-200'
              }`}
            >
              {highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-white text-indigo-600 text-xs font-bold px-3 py-1 rounded-full shadow">Most popular</span>
                </div>
              )}
              <div>
                <h3 className={`font-bold text-lg ${highlight ? 'text-white' : 'text-gray-900'}`}>{name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className={`text-4xl font-bold ${highlight ? 'text-white' : 'text-gray-900'}`}>
                    {price === 0 ? 'Free' : `$${price}`}
                  </span>
                  {period && <span className={`text-sm ${highlight ? 'text-indigo-200' : 'text-gray-400'}`}>{period}</span>}
                </div>
              </div>
              <ul className="flex flex-col gap-2.5 flex-1">
                {features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <svg className={`w-4 h-4 mt-0.5 shrink-0 ${highlight ? 'text-indigo-200' : 'text-indigo-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className={highlight ? 'text-indigo-100' : 'text-gray-700'}>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={href}
                className={`block text-center py-3 rounded-lg font-semibold text-sm transition-colors ${
                  highlight
                    ? 'bg-white text-indigo-600 hover:bg-indigo-50'
                    : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="bg-gray-50/60 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-10">Common questions</h2>
          <div className="divide-y divide-gray-200 rounded-2xl border border-gray-200 overflow-hidden bg-white">
            {FAQS.map(({ q, a }, i) => (
              <div key={i}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                  className="w-full text-left px-5 sm:px-6 py-5 flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-900 text-sm">{q}</span>
                  <span className={`text-gray-400 text-xl transition-transform shrink-0 ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
                </button>
                {openFaq === i && (
                  <div className="px-5 sm:px-6 pb-5">
                    <p className="text-sm text-gray-500 leading-relaxed">{a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="bg-indigo-600 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to stop losing deals to bad PDFs?
          </h2>
          <p className="text-indigo-200 text-lg mb-10">
            Your first proposal is free. No card, no install, no risk.
          </p>
          <Link
            href="/sign-up"
            className="inline-block rounded-xl bg-white px-8 sm:px-10 py-4 text-base font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors shadow-lg"
          >
            Start for free — no card needed
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 px-4 sm:px-6 py-8">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <span className="font-semibold text-gray-600">propflow</span>
          <div className="flex gap-5 sm:gap-6">
            <a href="#pricing" className="hover:text-gray-600 transition-colors">Pricing</a>
            <Link href="/sign-in" className="hover:text-gray-600 transition-colors">Sign in</Link>
            <a href="mailto:privacy@propflow.app" className="hover:text-gray-600 transition-colors">Privacy</a>
            <a href="mailto:privacy@propflow.app" className="hover:text-gray-600 transition-colors">Contact</a>
          </div>
          <p className="text-xs text-center sm:text-right">Your proposal data is private and never shared.</p>
        </div>
      </footer>
    </div>
  )
}
