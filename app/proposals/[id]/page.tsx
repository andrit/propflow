import { auth } from '@clerk/nextjs/server'
import { redirect, notFound } from 'next/navigation'
import { findProposal } from '@/lib/proposals/queries'
import ProposalEditor from './ProposalEditor'

export default async function ProposalPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) redirect('/')

  const { id } = await params
  const proposal = await findProposal(id)
  if (!proposal) notFound()
  if (proposal.userId !== userId) notFound()

  return <ProposalEditor initialProposal={proposal} />
}
