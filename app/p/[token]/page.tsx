import { notFound } from 'next/navigation'
import Link from 'next/link'
import { findShareByToken, findProposal, findLatestVersion } from '@/lib/proposals/queries'
import { getBrand } from '@/lib/brand/service'
import { getDownloadUrl } from './download'
import ShareView from './ShareView'

export default async function PublicSharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const share = await findShareByToken(token)

  if (!share) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="text-4xl mb-4">🔗</p>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Link not found</h1>
          <p className="text-gray-500 text-sm">This proposal link has expired or was never valid.</p>
        </div>
      </main>
    )
  }

  const proposal = await findProposal(share.proposalId)
  if (!proposal) notFound()

  // Archived with no revision — withdrawal notice
  if (proposal.status === 'archived' && !proposal.supersededById) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="text-4xl mb-4">📁</p>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Proposal withdrawn</h1>
          <p className="text-gray-500 text-sm">This proposal is no longer active. Please contact the sender for an updated version.</p>
        </div>
      </main>
    )
  }

  const brand = await getBrand(proposal.userId)
  const pdfDownloadUrl = proposal.pdfR2Key ? await getDownloadUrl(proposal.pdfR2Key) : null

  // Find the latest version for the "newer version" banner
  let latestShareToken: string | null = null
  if (proposal.supersededById) {
    const latest = await findLatestVersion(proposal.id)
    if (latest && latest.id !== proposal.id) {
      // Get the share token for the latest version
      const { findShareByProposal } = await import('@/lib/proposals/queries')
      const latestShare = await findShareByProposal(latest.id)
      latestShareToken = latestShare?.token ?? null
    }
  }

  return (
    <ShareView
      proposal={proposal}
      brand={brand}
      pdfDownloadUrl={pdfDownloadUrl}
      latestShareToken={latestShareToken}
    />
  )
}
