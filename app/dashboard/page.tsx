import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { listProposals } from '@/lib/proposals/queries'
import type { Proposal } from '@/lib/proposals/schemas'

const STATUS_STYLES: Record<string, string> = {
  draft:     'bg-gray-100 text-gray-600',
  finalized: 'bg-blue-100 text-blue-700',
  archived:  'bg-amber-100 text-amber-700',
}

const STATUS_LABELS: Record<string, string> = {
  draft:     'Draft',
  finalized: 'Sent',
  archived:  'Archived',
}

function ProposalCard({ p }: { p: Proposal }) {
  const isSuperseded = !!p.supersededById
  return (
    <Link
      href={p.status === 'draft' ? `/proposals/${p.id}` : `/proposals/${p.id}`}
      className={`block bg-white rounded-xl border border-gray-200 p-5 hover:border-violet-300 hover:shadow-sm transition-all ${isSuperseded ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 truncate">{p.title}</p>
          <p className="text-sm text-gray-500 mt-0.5">
            {p.client.company ? `${p.client.company} · ` : ''}{p.client.name}
          </p>
        </div>
        <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[p.status]}`}>
          {STATUS_LABELS[p.status]}
        </span>
      </div>
      <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
        <span>{p.proposalType.charAt(0).toUpperCase() + p.proposalType.slice(1)}</span>
        <span>·</span>
        <span>{p.template === 'executive' ? 'Executive' : 'Clean'} template</span>
        <span>·</span>
        <span>Updated {new Date(p.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
      </div>
      {isSuperseded && (
        <p className="mt-2 text-xs text-amber-600 font-medium">Revision in progress</p>
      )}
    </Link>
  )
}

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect('/')

  const proposals = await listProposals(userId)
  const active = proposals.filter(p => p.status !== 'archived')
  const archived = proposals.filter(p => p.status === 'archived')

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Proposals</h1>
            <p className="text-sm text-gray-500 mt-0.5">{active.length} active</p>
          </div>
          <Link
            href="/proposals/new"
            className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            + New Proposal
          </Link>
        </div>

        {/* Active proposals */}
        {active.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-xl">
            <p className="text-gray-400 text-sm mb-4">No proposals yet.</p>
            <Link
              href="/proposals/new"
              className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors inline-block"
            >
              Create your first proposal
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {active.map(p => <ProposalCard key={p.id} p={p} />)}
          </div>
        )}

        {/* Archived */}
        {archived.length > 0 && (
          <div className="mt-10">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Archived</h2>
            <div className="flex flex-col gap-3">
              {archived.map(p => <ProposalCard key={p.id} p={p} />)}
            </div>
          </div>
        )}

        {/* Nav */}
        <div className="mt-10 pt-6 border-t border-gray-200 flex gap-4 text-sm text-gray-500">
          <Link href="/brand" className="hover:text-gray-900 transition-colors">Brand Settings</Link>
        </div>
      </div>
    </main>
  )
}
