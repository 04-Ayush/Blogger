'use client'

import Navbar from '@/app/components/Navbar'
import Sidebar from '@/app/components/Sidebar'
import RoleGuard from '@/app/components/RoleGuard'

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Navbar />

      <div className="flex min-h-screen">
        <Sidebar />

        <main className="flex-1 px-4 py-6">
          <RoleGuard allowed={['admin']} redirectTo="/dashboard">
            <div className="mb-6">
              <h1 className="text-2xl font-semibold tracking-tight text-white">Admin</h1>
              <p className="mt-1 text-sm text-white/70">Admin panel</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
              Admin tools coming soon.
            </div>
          </RoleGuard>
        </main>
      </div>
    </div>
  )
}

