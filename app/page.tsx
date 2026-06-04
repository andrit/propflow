import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const { userId } = await auth()

  if (userId) {
    redirect('/dashboard')
  }

  // Phase 5: replace with <LandingPage />
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-white">
      <div className="text-center px-6">
        <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-4">
          propflow
        </h1>
        <p className="text-lg sm:text-xl text-gray-500 mb-8 max-w-md mx-auto">
          Professional proposals in minutes. Win more clients.
        </p>
        <a
          href="/sign-up"
          className="inline-block bg-violet-600 hover:bg-violet-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
        >
          Get started free
        </a>
      </div>
    </main>
  )
}
