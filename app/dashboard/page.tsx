import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect('/')

  // Phase 3: replace with <ProposalDashboard userId={userId} />
  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Proposals</h1>
        <p className="text-gray-500">Dashboard coming in Phase 3.</p>
      </div>
    </main>
  )
}
